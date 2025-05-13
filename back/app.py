from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error
import torch
import torch.nn as nn
import torch.optim as optim
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import matplotlib

matplotlib.use("Agg")  # Use non-interactive backend
import base64
from io import BytesIO
import json
import sys  # For printing to stderr for logging in simple cases
import traceback  # For detailed exception logging

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Check for CUDA availability and set the device accordingly
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}", file=sys.stderr)


# Model Definition
class PredictionModel(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super(PredictionModel, self).__init__()
        self.hidden_size = hidden_size
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True)
        self.linear = nn.Linear(hidden_size, output_size)

    def forward(self, input_seq):
        lstm_out, _ = self.lstm(input_seq)
        prediction = self.linear(lstm_out[:, -1, :])
        return prediction


def create_sequences(data, seq_length):
    sequences = []
    targets = []
    for i in range(len(data) - seq_length):
        seq = data[i : i + seq_length]
        target = data[i + seq_length]
        sequences.append(seq)
        targets.append(target)
    return np.array(sequences), np.array(targets)


def plot_to_base64(fig):
    buf = BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight")
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode("utf-8")
    buf.close()
    plt.close(fig)
    return img_str


@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.json
    raw_ticker_input = data.get("ticker")

    if not raw_ticker_input:
        return jsonify({"error": "Ticker symbol is required."}), 400

    # --- START: Robust ticker input handling ---
    ticker = ""
    if isinstance(raw_ticker_input, str):
        # Take the first part if space-separated to ensure single ticker processing
        ticker = raw_ticker_input.strip().split(" ")[0]
    # If you expect to sometimes receive a list from the frontend:
    # elif isinstance(raw_ticker_input, list):
    #     if raw_ticker_input:
    #         ticker = str(raw_ticker_input[0]).strip().split(' ')[0]
    else:
        # Assuming ticker should primarily be a string
        return (
            jsonify({"error": "Invalid ticker format. Ticker should be a string."}),
            400,
        )

    if not ticker:  # Handles case of empty string after split or empty list
        return (
            jsonify({"error": "Ticker symbol is empty or invalid after processing."}),
            400,
        )
    # --- END: Robust ticker input handling ---

    print(
        f"Processing single ticker: {ticker}", file=sys.stderr
    )  # Log the ticker being processed

    # Determine currency symbol based on ticker suffix
    currency_symbol = "$"
    if ticker.upper().endswith(".NS") or ticker.upper().endswith(".BO"):
        currency_symbol = "₹"

    today = datetime.now().date()
    end_date = today.strftime("%Y-%m-%d")
    start_date = "2020-01-01"

    try:
        print(f"Attempting to download data for ticker: {ticker}", file=sys.stderr)
        stock_data = yf.download(ticker, start=start_date, end=end_date, progress=False)

        if stock_data.empty:
            error_message = f"No data found for ticker: {ticker}. The ticker might be invalid, delisted, or there could be a temporary issue with the data provider. Please verify the ticker symbol or try again later."
            print(error_message, file=sys.stderr)
            return jsonify({"error": error_message}), 404

        # Now stock_data["Close"], stock_data["Volume"] etc. should reliably be Series
        close_prices = stock_data["Close"].values.reshape(-1, 1)

        scaler = MinMaxScaler()
        scaled_prices = scaler.fit_transform(close_prices)

        sequence_length = 30
        if len(scaled_prices) <= sequence_length:
            return (
                jsonify(
                    {
                        "error": f"Not enough historical data for ticker {ticker} to create sequences (need more than {sequence_length} days)."
                    }
                ),
                400,
            )

        sequences, targets = create_sequences(scaled_prices, sequence_length)

        train_size = int(0.8 * len(sequences))
        if train_size == 0 or (len(sequences) - train_size) == 0:
            return (
                jsonify(
                    {
                        "error": f"Not enough data for ticker {ticker} to split into training/testing sets after creating sequences."
                    }
                ),
                400,
            )

        train_sequences = torch.tensor(sequences[:train_size], dtype=torch.float32).to(
            device
        )
        train_targets = torch.tensor(targets[:train_size], dtype=torch.float32).to(
            device
        )
        test_sequences = torch.tensor(sequences[train_size:], dtype=torch.float32).to(
            device
        )
        test_targets = torch.tensor(targets[train_size:], dtype=torch.float32).to(
            device
        )

        input_size = 1
        hidden_size = 50
        output_size = 1
        model = PredictionModel(input_size, hidden_size, output_size).to(device)

        criterion = nn.MSELoss()
        optimizer = optim.Adam(model.parameters(), lr=0.001)

        epochs = 200
        loss_history = []
        for epoch in range(epochs):
            model.train()
            optimizer.zero_grad()
            outputs = model(train_sequences)
            loss = criterion(outputs, train_targets)
            loss.backward()
            optimizer.step()
            loss_history.append(loss.item())

        model.eval()
        with torch.no_grad():
            test_predictions = model(test_sequences)

        predicted_prices = scaler.inverse_transform(test_predictions.cpu().numpy())
        actual_prices = scaler.inverse_transform(test_targets.cpu().numpy())
        rmse = np.sqrt(mean_squared_error(actual_prices, predicted_prices))

        last_sequence_scaled = scaled_prices[-sequence_length:].reshape(
            1, sequence_length, 1
        )
        last_sequence_tensor = torch.tensor(
            last_sequence_scaled, dtype=torch.float32
        ).to(device)

        n_future_days = [10, 20, 50]
        all_future_predictions = {}
        model.eval()
        with torch.no_grad():
            for n_days in n_future_days:
                future_sequence = last_sequence_tensor.clone()
                predictions_for_n_days = (
                    []
                )  # Renamed to avoid confusion with outer scope 'predictions'
                for _ in range(n_days):
                    output = model(future_sequence)
                    predictions_for_n_days.append(output.cpu().numpy()[0, 0])
                    output_reshaped = output.view(1, 1, 1)
                    future_sequence = torch.cat(
                        (future_sequence[:, 1:, :], output_reshaped), dim=1
                    )
                future_predictions_values = scaler.inverse_transform(
                    np.array(predictions_for_n_days).reshape(-1, 1)
                )
                all_future_predictions[str(n_days)] = (
                    future_predictions_values.flatten().tolist()
                )

        last_date = stock_data.index[-1]
        future_dates = {}
        for n_days in n_future_days:
            dates = [last_date + timedelta(days=i) for i in range(1, n_days + 1)]
            future_dates[str(n_days)] = [date.strftime("%Y-%m-%d") for date in dates]

        fig, ax = plt.figure(figsize=(16, 10)), plt.gca()
        actual_dates = stock_data.index[
            len(train_sequences) + sequence_length :
        ].tolist()
        ax.plot(actual_dates, actual_prices, label="Actual Price", color="blue")
        ax.plot(actual_dates, predicted_prices, label="Predicted Price", color="red")

        for n_days in n_future_days:
            future_date_list = [
                last_date + timedelta(days=i) for i in range(1, n_days + 1)
            ]
            ax.plot(
                future_date_list,
                all_future_predictions[str(n_days)],
                label=f"Next {n_days} Days Prediction",
                linestyle="--",
            )

        ax.set_title(f"{ticker} Stock Price Prediction and Future Forecast")
        ax.set_xlabel("Date")
        ax.set_ylabel(f"Price ({currency_symbol})")  # MODIFIED LINE
        ax.legend()
        ax.grid(True)
        plt.tight_layout()
        plot_image = plot_to_base64(fig)

        latest_price = float(close_prices[-1][0])

        # Fix: Convert Series to list correctly
        historical = {
            "dates": [date.strftime("%Y-%m-%d") for date in stock_data.index.tolist()],
            "prices": stock_data[
                "Close"
            ].values.tolist(),  # Fixed: use .values.tolist() instead of .tolist()
            "volumes": stock_data[
                "Volume"
            ].values.tolist(),  # Fixed: use .values.tolist() instead of .tolist()
        }

        response_data = {
            "ticker": ticker,
            "currency_symbol": currency_symbol,  # ADDED LINE
            "latest_price": latest_price,
            "rmse": float(rmse),
            "plot": plot_image,
            "historical": historical,
            "future_predictions": {
                "dates": future_dates,
                "values": all_future_predictions,
            },
            "loss_history": loss_history[::10],  # Sending a sampled version
            "prediction_performance": {
                "actual": actual_prices.flatten().tolist(),
                "predicted": predicted_prices.flatten().tolist(),
                "dates": [date.strftime("%Y-%m-%d") for date in actual_dates],
            },
            "market_summary": {
                "open": float(stock_data["Open"].iloc[-1]),
                "high": float(stock_data["High"].iloc[-1]),
                "low": float(stock_data["Low"].iloc[-1]),
                "volume": int(stock_data["Volume"].iloc[-1]),
                "date": stock_data.index[-1].strftime("%Y-%m-%d"),
            },
            "percent_change": (
                round(
                    ((latest_price / float(stock_data["Close"].iloc[-2])) - 1) * 100, 2
                )
                if len(stock_data["Close"])
                > 1  # stock_data["Close"] is a Series, len() is fine
                else 0
            ),
        }
        return jsonify(response_data)

    except Exception as e:
        print(
            f"An unexpected error occurred for ticker {ticker}: {str(e)}",
            file=sys.stderr,
        )
        traceback.print_exc(file=sys.stderr)
        return jsonify({"error": f"An internal server error occurred: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)

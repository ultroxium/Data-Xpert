import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler  # Make sure to import MinMaxScaler

# Assuming 'data' is your preprocessed time series data with features and target variable
# Example: data['precipitation'] is the target variable, and other columns are features
# If you have multiple features, you might want to normalize them

# Prepare data for LSTM
data = data.dropna()  # Remove rows with NaN values if any
target = data['precipitation'].values
# Assuming you have other features (replace with actual feature columns if needed)
features = data[['temp_max', 'temp_min']].values  # Example features

# Normalize data
# Create separate scalers for target and features
target_scaler = MinMaxScaler()  # Scaler for target
feature_scaler = MinMaxScaler()  # Scaler for features

target = target_scaler.fit_transform(target.reshape(-1, 1)).flatten()  # Normalize target
features = feature_scaler.fit_transform(features)  # Normalize features

# Create sequences
seq_length = 10  # Length of input sequence
X = []
y = []
for i in range(len(target) - seq_length):
    X.append(np.concatenate((features[i:i + seq_length], target[i:i+seq_length].reshape(-1, 1)), axis=1))
    y.append(target[i + seq_length])

X = np.array(X)
y = np.array(y)

# Split into train and test sets
train_size = int(0.8 * len(X))
X_train, X_test = X[:train_size], X[train_size:]
y_train, y_test = y[:train_size], y[train_size:]

# Convert to PyTorch tensors
X_train = torch.tensor(X_train, dtype=torch.float32)
y_train = torch.tensor(y_train, dtype=torch.float32)
X_test = torch.tensor(X_test, dtype=torch.float32)
y_test = torch.tensor(y_test, dtype=torch.float32)

# Define the LSTM model
class LSTMModel(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers, output_size):
        super(LSTMModel, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)
    
    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).requires_grad_()
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).requires_grad_()
        out, (hn, cn) = self.lstm(x, (h0.detach(), c0.detach()))
        out = self.fc(out[:, -1, :])
        return out

# Hyperparameters
input_size = 3  # Number of features + target in sequence
hidden_size = 50
num_layers = 1
output_size = 1
learning_rate = 0.001
num_epochs = 100

# Initialize model, loss function, and optimizer
model = LSTMModel(input_size, hidden_size, num_layers, output_size)
criterion = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)

# Train the model
for epoch in range(num_epochs):
    model.train()
    outputs = model(X_train)
    optimizer.zero_grad()
    loss = criterion(outputs.squeeze(), y_train)
    loss.backward()
    optimizer.step()
    if (epoch + 1) % 10 == 0:
        print(f'Epoch [{epoch+1}/{num_epochs}], Loss: {loss.item():.4f}')

# Model Evaluation
model.eval()
with torch.no_grad():
    predicted = model(X_test)
    predicted = target_scaler.inverse_transform(predicted.numpy())  # Inverse transform predictions
    y_test_original = target_scaler.inverse_transform(y_test.reshape(-1, 1))  # Inverse transform actual values

    # Compare predicted vs actual (just printing out few values for demonstration)
    print(f'Predicted vs Actual (first 5 values):')
    for i in range(5):
        print(f'Predicted: {predicted[i]}, Actual: {y_test_original[i]}')

print("LSTM prediction completed.")


def fine_tune_model(new_data, model, target_scaler, feature_scaler, seq_length=10, num_epochs=10):
    # Normalize new data
    target = new_data['precipitation'].values
    features = new_data[['temp_max', 'temp_min']].values  # Replace with your actual feature columns

    target = target_scaler.transform(target.reshape(-1, 1)).flatten()  # Normalize target
    features = feature_scaler.transform(features)  # Normalize features

    # Create sequences
    X = []
    y = []
    for i in range(len(target) - seq_length):
        X.append(np.concatenate((features[i:i + seq_length], target[i:i + seq_length].reshape(-1, 1)), axis=1))
        y.append(target[i + seq_length])
    X = np.array(X)
    y = np.array(y)

    # Convert to PyTorch tensors
    X = torch.tensor(X, dtype=torch.float32)
    y = torch.tensor(y, dtype=torch.float32)

    # Fine-tune the model
    model.train()
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

    for epoch in range(num_epochs):
        optimizer.zero_grad()
        outputs = model(X)
        loss = criterion(outputs.squeeze(), y)
        loss.backward()
        optimizer.step()

        if (epoch + 1) % 10 == 0:
            print(f'Fine-tuning Epoch [{epoch+1}/{num_epochs}], Loss: {loss.item():.4f}')
    
    print("Fine-tuning complete.")

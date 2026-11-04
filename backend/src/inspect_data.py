import pandas as pd
import numpy as np

cols = ['unit_nr', 'time_cycles', 'setting_1', 'setting_2', 'setting_3'] + [f's_{i}' for i in range(1, 22)]
df = pd.read_csv('backend/data/train_FD001.txt', sep=r'\s+', header=None, names=cols)

print("Dataset shape:", df.shape)
print("Units:", df['unit_nr'].nunique())

# Check std dev of sensors to find constant/non-informative features
std = df.std()
print("\nSensor Standard Deviations:")
for col in cols[2:]:
    print(f"{col:10s}: std={std[col]:.6f}, min={df[col].min():.4f}, max={df[col].max():.4f}")

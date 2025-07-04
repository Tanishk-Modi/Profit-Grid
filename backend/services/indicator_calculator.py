def calculate_sma(prices: list, period: int) -> list:
    sma_values = []
    for i in range(len(prices)):
        if i + 1 >= period:
            recent_prices = prices[i + 1 - period:i + 1]
            average = sum(recent_prices) / period
            sma_values.append(round(average, 2))
        else:
            sma_values.append(None)
    return sma_values


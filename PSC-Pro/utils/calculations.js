function calculatePositionSize(accountBalance, riskPercent, entryPrice, stopLossPrice) {
  const riskMoney = accountBalance * (riskPercent / 100);
  const stopDistance = Math.abs(entryPrice - stopLossPrice);

  if (stopDistance === 0) {
    return { error: "Entry and Stop Loss cannot be the same" };
  }

  const units = riskMoney / stopDistance;
  const direction = entryPrice > stopLossPrice ? "LONG" : "SHORT";
  const positionValue = units * entryPrice;

  return {
    direction,
    units: Number(units.toFixed(4)),
    riskMoney: Number(riskMoney.toFixed(2)),
    stopDistance: Number(stopDistance.toFixed(5)),
    positionValue: Number(positionValue.toFixed(2))
  };
}
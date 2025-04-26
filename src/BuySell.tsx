function buyStock() {
  const selectedStock = stock[stockBuyIndex];
  const sharesToBuy = stockBuyAmount;
  const totalCost = Number((sharesToBuy * Number(selectedStock.price)).toFixed(2));

  if (account.length === 0) {
    window.alert("You have no money. Deposit funds to buy stocks.");
    handleBuyClose();
    return;
  }

  const oldBalance = Number(account[0].balance);

  if (oldBalance < totalCost) {
    window.alert(`Not enough balance to buy ${selectedStock.name}. Needed: $${totalCost}`);
    handleBuyClose();
    return;
  }

  const existingOwned = ownedStock.find((os) => os.stockId === selectedStock.id);

  if (existingOwned) {
   
    client.models.Ownedstock.update({
      id: existingOwned.id,
      currentPrice: selectedStock.price,
      stockName: selectedStock.name,
      owns: true,
      stockId: selectedStock.id,
      shares: (Number(existingOwned.shares) + sharesToBuy).toFixed(2).toString(),
    });
  } else {
    
    client.models.Ownedstock.create({
      currentPrice: selectedStock.price,
      stockName: selectedStock.name,
      owns: true,
      stockId: selectedStock.id,
      shares: sharesToBuy.toFixed(2).toString(),
    });
  }


  client.models.Transaction.create({
    type: "buystock",
    amount: totalCost.toString(),
    date: new Date().toISOString().split("T")[0],
    stock: selectedStock.name,
    owns: true,
    success: true,
    stockId: selectedStock.id,
    shares: sharesToBuy.toFixed(2).toString(),
  });

 
  const newBalance = oldBalance - totalCost;
  const newAccountValue = Number(account[0].accountvalue) + totalCost;

  client.models.Account.update({
    id: account[0].id,
    balance: newBalance.toFixed(2).toString(),
    accountvalue: newAccountValue.toFixed(2).toString(),
  });

  handleBuyClose();
}

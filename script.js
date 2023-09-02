const calculateButton = document.getElementById("calculate-button");
const paymentButton = document.getElementById("payment-button");
const paymentCompleteButton = document.getElementById("payment-complete-button");
const resultArea = document.getElementById("result");
const paymentInput = document.getElementById("payment");
const salesInfoTable = document.getElementById("sales-info-table");
const remainingStock = document.getElementById("remaining-stock");
const totalRevenue = document.getElementById("total-revenue");
const clearDataButton = document.getElementById("clear-data-button");
const notification = document.getElementById("notification");

let stock = { A: 10, B: 10 };
let revenue = 0;

// ローカルストレージから販売情報を取得
const savedSalesInfo = JSON.parse(localStorage.getItem("salesInfo")) || [];

// ページ読み込み時に販売情報をテーブルに表示
for (const sale of savedSalesInfo) {
    appendSaleToTable(sale.time, sale.item, sale.quantity, sale.paymentMethod);
}

function showButton(buttonToShow) {
    calculateButton.style.display = "none";
    paymentButton.style.display = "none";
    paymentCompleteButton.style.display = "none";
    buttonToShow.style.display = "block";
}

function appendSaleToTable(time, item, quantity, paymentMethod) {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `<td>${time}</td><td>${item}</td><td>${quantity}個</td><td>${paymentMethod}</td>`;
    salesInfoTable.appendChild(newRow);
}

calculateButton.addEventListener("click", () => {
    const quantityA = parseInt(document.getElementById("quantity-A").value);
    const quantityB = parseInt(document.getElementById("quantity-B").value);
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked');

    if (quantityA >= 0 && quantityB >= 0 && paymentMethod) {
        const totalPriceA = quantityA * 450;
        const totalPriceB = quantityB * 450;
        const totalAmount = totalPriceA + totalPriceB;

        resultArea.innerHTML = `合計金額: ${totalAmount}円`;
        paymentInput.style.display = "block";
        paymentInput.type = "text"; // テキスト形式での入力に変更
        showButton(paymentButton);
    } else {
        alert("個数または決済方法が不正です。");
    }
});

paymentButton.addEventListener("click", () => {
    const paymentAmount = parseFloat(paymentInput.value);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
        alert("支払い金額が不正または不足です。");
        return;
    }

    const quantityA = parseInt(document.getElementById("quantity-A").value);
    const quantityB = parseInt(document.getElementById("quantity-B").value);
    const totalPriceA = quantityA * 450;
    const totalPriceB = quantityB * 450;
    const totalAmount = totalPriceA + totalPriceB;

    const change = paymentAmount - totalAmount;
    if (change >= 0) {
        resultArea.innerHTML = `合計金額: ${totalAmount}円<br>お預かり: ${paymentAmount}円<br>お釣り: ${change}円`;

        // 販売情報を更新
        const currentTime = new Date().toLocaleTimeString();
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
        appendSaleToTable(currentTime, "アクリルキーホルダーA", quantityA, paymentMethod);
        appendSaleToTable(currentTime, "アクリルキーホルダーB", quantityB, paymentMethod);

        // ローカルストレージに販売情報を保存
        savedSalesInfo.push({ time: currentTime, item: "アクリルキーホルダーA", quantity: quantityA, paymentMethod: paymentMethod });
        savedSalesInfo.push({ time: currentTime, item: "アクリルキーホルダーB", quantity: quantityB, paymentMethod: paymentMethod });
        localStorage.setItem("salesInfo", JSON.stringify(savedSalesInfo));

        // 在庫と売上を更新
        stock.A -= quantityA;
        stock.B -= quantityB;
        revenue += totalAmount;
        remainingStock.innerHTML = `残りの在庫数（A: ${stock.A}個, B: ${stock.B}個）`;
        totalRevenue.innerHTML = `現在の売上総額: ${revenue}円`;

        // 預かり金額入力欄を非表示に
        paymentInput.style.display = "none";

        // ボタンを支払い完了ボタンに切り替え
        showButton(paymentCompleteButton);
    } else {
        alert("支払い金額が不足しています。");
    }
});

paymentCompleteButton.addEventListener("click", () => {
    // 再度入力できるようにフォームをリセット
    document.getElementById("quantity-A").value = "";
    document.getElementById("quantity-B").value = "";
    paymentInput.value = "";
    paymentInput.type = "number"; // 数値形式に戻す
    resultArea.innerHTML = "";
    showButton(calculateButton);
});

clearDataButton.addEventListener("click", () => {
    // ローカルストレージのデータを削除
    localStorage.removeItem("salesInfo");

    // 販売情報テーブルをクリア
    while (salesInfoTable.firstChild) {
        salesInfoTable.removeChild(salesInfoTable.firstChild);
    }

    // 在庫と売上をリセット
    stock = { A: 10, B: 10 };
    revenue = 0;
    remainingStock.innerHTML = `残りの在庫数（A: ${stock.A}個, B: ${stock.B}個）`;
    totalRevenue.innerHTML = `現在の売上総額: 0円`;
});

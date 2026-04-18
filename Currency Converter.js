const BASE_URL = "https://open.er-api.com/v6/latest";
const dropdowns=document.querySelectorAll(".dropdown select");

const btn = document.querySelector("form button");

const fromCurr=document.querySelector(".from select");

const toCurr=document.querySelector(".to select");

const msg = document.querySelector(".msg");



for (let select of dropdowns){
    for (let currCode in countryList){
        let newOption = document.createElement("option");
        newOption.innerText=currCode;
        newOption.value = currCode;
        if(select.name==="from"  && currCode==="USD"){
            newOption.selected=true;
        }
        else if(select.name==="to"  && currCode==="PKR"){
            newOption.selected=true;}
        select.append(newOption);
}

select.addEventListener("change",(evt)=>{
    updateFlag(evt.target);
});
}

const updateFlag = (element) =>{
    let currCode=element.value;
    let countryCode = countryList[currCode];
    let newSrc =`https://flagsapi.com/${countryCode}/flat/64.png`;
    let img = element.parentElement.querySelector("img");
    img.src = newSrc;
};


btn.addEventListener("click",(evt)=>{
    evt.preventDefault();
    updateExchangeRate();

});

window.addEventListener("load" ,()=>{
    updateExchangeRate();
});

const updateExchangeRate=async ()=> {

    let amount = document.querySelector(".amount input");
    let amtVal = parseFloat(amount.value);

    if(isNaN(amtVal) || amtVal <1){
        amtVal=1;
        amount.value = "1";
    }


    const apiUrl = `${BASE_URL}/${fromCurr.value}`;
    console.log("URL:", apiUrl);

    let response = await fetch(apiUrl);
    let data = await response.json();
    let rate = data.rates[toCurr.value];
    let finalAmount = (amtVal * rate).toFixed(2);
    msg.innerText = `${amtVal} ${fromCurr.value}=${finalAmount} ${toCurr.value}`;

};


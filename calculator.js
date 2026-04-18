function addNumber(val){
    var input = document.getElementById("input")
     console.log("input",input)
     input.value +=val       //input.value=input.value + val

}


function calcAns(){
    var input=document.getElementById("input")
    console.log(eval(input.value))
    var ans = eval(input.value)
    
    input.value = ans
}

function clearValue(){
     var input=document.getElementById("input")
     //console.log("input",input.value.slice(0.-1)
    input.value=input.value.slice(0,-1)

}

function clearAllValue(){
    var input=document.getElementById("input")
    input.value="0"
}
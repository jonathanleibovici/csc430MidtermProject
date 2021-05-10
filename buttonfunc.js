// let something = async (YesButton, NoButton) =>  {

// let res = await fetch(url);

// if (put some condition based on res here) {

// //do something to YesButton or NoButton

// }

// else {

// //do something to YesButton or NoButton

// }

// 
let something = async () => {
    
    let res = await fetch('localhost:5000/something');
    console.log("something",res);
}
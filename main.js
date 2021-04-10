// get the values from the form 
const numberInput = document.getElementById('number'),
        textInput = document.getElementById('msg'),
        button = document.getElementById('button'),
        response = document.querySelector('.response');

//now check if the submit button was clicked or not
button.addEventListener('click',send,false);

//send function 
function send() {
    //retrieve the data and store them into variables
    const number = numberInput.value;
    const text = textInput.value;

    //request to our server fetch the post data
    fetch('/', {
        
        //specify an object
        method: 'post',
        headers: {

            //content type we want is json
            'content-type':'application/json'
        },
        //turn the json content into a string
   body: JSON.stringify({number: number,text: text})
    })
    //to get the response fetch api uses .then
    .then(function(res){
        console.log(res);
    })
    .catch(function(err){
        console.log(err);
    });
}

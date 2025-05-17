const loginForm = document.querySelector("#loginForm");
const loginButton = document.querySelector("#loginSubmitButton");
const loginUsername = document.querySelector("#usernameBox");
const loginPassword = document.querySelector("#passwordBox");

const signupForm = document.querySelector("#signupForm");
const signupButton = document.querySelector("#signupSubmitButton");
const signupUsername = document.querySelector("#signupName");
const signupPassword = document.querySelector("#signupPassword");

async function loginHandler(event){
    event.preventDefault();
    let username = loginUsername.value.trim();
    let password = loginPassword.value.trim();
    //.trim removes any blank space that may ruin things

    if(username && password){
        const login = await fetch('/api/user/login', {
            method: 'Post',
            body: JSON.stringify({
                "username" : username,
                "password": password
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        if(login.ok){
            let parsedString
            for await(const chunk of login.body){
                let decodedString = new TextDecoder().decode(chunk);
                parsedString = JSON.parse(decodedString);
            }
            user = parsedString;
            localStorage.setItem('user_id', parsedString);
            localStorage.setItem('loggedIn', true);
            window.location.href = "/choice.html";
            
        }
        else{
            console.log("Fail");
        }
    }
}

async function signupHandler(event){
    event.preventDefault();

    let username = signupUsername.value.trim();
    let password = signupPassword.value.trim();

    if(username && password){
        const login = await fetch('/api/user/create', {
            method: 'Post',
            body: JSON.stringify({
                "username" : username,
                "password": password
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        console.log(login);

        if(login.ok){
            let parsedString
            for await(const chunk of login.body){
                let decodedString = new TextDecoder().decode(chunk);
                parsedString = JSON.parse(decodedString);
            }
            user = parsedString;
            window.location.href = "choice.html";
        }
        else{
            console.log("Fail");
        }
    }
}

loginButton.addEventListener('click',loginHandler);

signupButton.addEventListener('click', signupHandler);
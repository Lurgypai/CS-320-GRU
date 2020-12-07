function playGameOptions() {

    let menu_div = document.getElementById("main_menu_div");

    
}

function validName() {

    let name_div= document.getElementById("enter_name_div");
    let menu_div = document.getElementById("main_menu_div");
    let nameTxt = document.getElementById("name_input");
    let welcomeTxt = document.getElementById("player_welcome_div");

    if (nameTxt.value !== ""){
        name_div.style.display = "none";
        menu_div.style.visibility = "visible";
        welcomeTxt.innerHTML += `Welcome, ${nameTxt.value}!`
    }
}
function validName() {

    let name_div= document.getElementById("enter_name_div");
    let menu_div = document.getElementById("main_menu_div");
    let nameTxt = document.getElementById("name_input");
    let welcomeTxt = document.getElementById("player_welcome_div");

    if (nameTxt.value !== ""){
        name_div.style.display = "none";
        menu_div.style.display = "block";
        welcomeTxt.innerHTML += `Welcome, ${nameTxt.value}!`
    }
}

function twoPlayerOptions() {

  let twoP_options_div = document.getElementById("two_player_options_div");

  if (twoP_options_div.style.display === "none"){

    twoP_options_div.style.display = "block";
  }
  else twoP_options_div.style.display = "none";
}

function sendMsgToServer() {
  console.log("hello");
}

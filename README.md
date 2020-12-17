CS 320
Project 1
Riley M
Quinlan B
Keegan S

Here's hoping we didn't bite off more than we can chew.

The SRS document is a starting point for understanding the project and its intentions. It features information regarding an overall description of the project, the project's contextual items, and the requirements (functional and non-functional).   

The Software design document is useful in providing a visual aspect of our software. This is done by providing the Activity, Class and Behavioral diagrams to demonstrate how our software will be structured and used. We are currently in the designing and modeling phase of our project after finishing the Software design document.

# Play

Visit http://vibecheckers.com and simply type in a name and room code :D

# Testing

To test the server locally, you must install nodejs, and the ws library. With nodejs installed the command "npm install ws" in the terminal should suffice for installing the library. Once this is installed, you can clone the repository to your local directory. From the "app" folder, the command "node server.js" will start the server. To join a game, simply open the index.html page in a browser, and join as normal. Open a second instance of the page to join a second player to the game. If the clients aren't connecting, check inside of "play_game.html" to ensure that the "url" variable is set to local host, and not the server ip.
# ChessApp
A simple NodeJS Multiplayer chess app.


# Dependencies
[Chess.js](https://github.com/jhlywa/chess.j)

# Running
(Make sure you have Node.Js installed on your machine)
1. Clone the github repository.
2. Run the server using the command `node index.js`
3. Visit the page at localhost:80

# Errors that occur when running
**1. Error: listen EACCES: permission denied 0.0.0.0:80**

  This error occurs when using port 80, but you do not have access.
  
  To fix this, navigate to line 18 at `index.js`.
  
  Change the code from `const port = process.env.port` to `const port = process.env.portAbove`.
  
  This will change the port from 80 to 1024.


**2. Sqlite3 NPM Error** 

This error could occur when cloning the repository.

If this happens, navigate to the terminal and execute the following commands.
   
   `npm remove sqlite3`
   
   
   And then,
   
   
   `npm install sqlite3`

# To be added:
- Ratings
- Accounts
- Login tokens
- Device compatibility

# Virtual World Game

A web-based multiplayer game where users can log in and move around in a virtual world.

## Features

- User authentication (register and login)
- Real-time player movement
- Multiplayer functionality with Socket.IO
- Persistent player positions
- Simple and intuitive UI

## Technology Stack

- **Backend**: Python with Flask
- **Database**: SQLAlchemy with SQLite
- **Authentication**: Flask-Login
- **Real-time Communication**: Flask-SocketIO
- **Frontend**: HTML, CSS, JavaScript

## Getting Started

### Prerequisites

- Python 3.8 or higher
- [UV](https://github.com/astral-sh/uv) (optional, automated installation available)

### Installation

#### Option 1: Using UV (Recommended)

UV is a fast, reliable Python package installer and resolver. We provide a setup script that will install UV if needed and set up your environment:

```bash
# Make the setup script executable
chmod +x setup_uv.sh

# Run the setup script
./setup_uv.sh

# Activate the virtual environment
source venv/bin/activate
```

#### Option 2: Using pip

If you prefer to use pip:

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Running the Application

Once your environment is set up:

```bash
# Run the application
python app.py
```

Open your browser and navigate to `http://localhost:5001`

## How to Play

1. Register a new account or log in with existing credentials
2. Once logged in, you'll be taken to the game world
3. Use the arrow buttons on the screen or your keyboard arrow keys to move around
4. You'll see other online players in the world and can interact with them
5. Your position is automatically saved when you move

## Deployment to Railway

You can deploy this game to Railway, which offers a free tier that's perfect for this type of application:

### Prerequisites for Deployment

1. [Create a Railway account](https://railway.app/login) (you can sign up with GitHub)
2. Install the [Railway CLI](https://docs.railway.app/develop/cli) (optional but helpful)
3. Make sure you have a GitHub repository for your project

### Deployment Steps

1. Push your code to GitHub:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. Log in to Railway and create a new project:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will automatically detect your Python app

3. Set up environment variables in your Railway project:
   - Go to your project settings -> Variables
   - Add the following variables:
     - `SECRET_KEY`: A secure random string for your app
     - `DATABASE_URL`: This will be automatically provided by Railway if you add a PostgreSQL database

4. Add a PostgreSQL database to your project (optional but recommended):
   - From your project dashboard, click "New"
   - Select "Database" -> "PostgreSQL"
   - Railway will set up a database and add the connection details to your environment variables

5. Deploy your application:
   - Railway will automatically deploy your application when you push to your GitHub repository
   - You can also manually deploy from the dashboard or CLI

6. Access your application:
   - Once deployed, Railway will provide you with a public URL for your application
   - Share this URL with friends to let them join your game!

### Free Tier Limitations

Railway's free tier offers:
- $5 of usage credits per month
- 512MB RAM / 1GB disk
- Automatic HTTPS
- Multiple environment support

This should be sufficient for a small multiplayer game with a moderate number of users.

## Game Controls

- **Arrow Keys**: Move the player (Up, Down, Left, Right)
- **On-screen Buttons**: Alternative way to move the player

## Project Structure

- `app.py`: Main application file with Flask routes and Socket.IO events
- `templates/`: HTML templates for the web pages
- `static/`: CSS and JavaScript files
- `static/css/style.css`: Styling for the application
- `static/js/game.js`: Game logic and Socket.IO client-side code

## License

This project is open source and available for personal and educational use.

## Future Enhancements

- Chat functionality between players
- Avatars and customization options
- Game objects and interaction
- Different maps/worlds to explore
- Mobile-friendly controls

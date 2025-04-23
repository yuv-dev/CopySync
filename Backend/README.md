# Clipboard Sync Backend

Backend for real-time clipboard sync across devices.

## Project Structure

```
Backend
├── src
│   ├── app.js               # Entry point of the application
│   ├── controllers          # Contains route controllers
│   │   └── index.js         # Exports IndexController
│   ├── routes               # Defines application routes
│   │   └── index.js         # Exports setRoutes function
│   ├── models               # Contains data models
│   │   └── index.js         # Exports data models
│   └── utils                # Utility functions
│       └── index.js         # Exports utility functions
├── package.json             # npm configuration file
├── .env                     # Environment variables
├── .gitignore               # Files to ignore by Git
└── README.md                # Project documentation
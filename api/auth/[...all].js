const express = require('express');
const cors = require('cors');
const { betterAuth } = require('better-auth');
const { Pool } = require('pg');
const { toNodeHandler } = require('better-auth/node');

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Initialize Pool from environment variable DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      softwareBackground: { type: 'string' },
      hardwareBackground: { type: 'string' },
    },
  },
});

// Better-Auth handler for /api/auth/*
app.all('/api/auth/*', toNodeHandler(auth));

module.exports = app;

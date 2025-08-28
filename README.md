# 🏨 Hotel Platform - Multi-Tenant Food Delivery & Management System

[![Node.js Version](https://img.shields.io/badge/node.js-20.x-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/next.js-15.x-blue.svg)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/mongodb-latest-green.svg)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)](https://www.typescriptlang.org/)

A comprehensive hotel management and food delivery platform built with **Next.js 15**, **TypeScript**, **MongoDB**, and **Socket.io** that supports multi-tenant architecture with role-based access control.

## 🚀 Features

### 🎯 Core Functionality
- **Multi-tenant architecture** with isolated hotel data
- **Role-based authentication** (Customer, Owner, Sales Agent, Admin)
- **Real-time order tracking** via Socket.io
- **Payment integration** with Razorpay
- **AI-powered analytics** with failure risk detection
- **Responsive design** for all devices

### 👥 User Roles & Dashboards

#### 🛡️ Admin Dashboard
- Platform-wide analytics and metrics
- User management and hotel oversight
- Revenue tracking and commission monitoring
- System health and performance metrics

#### 🏢 Hotel Owner Dashboard
- **Menu Management**: Add, edit, delete menu items with categories
- **Order Management**: Real-time order status updates
- **Staff Management**: Employee tracking with salary management
- **Expense Tracking**: Categorized expense management
- **Analytics**: Revenue trends, popular items, failure risk analysis
- **Multi-branch support** with location-wise data

#### 🛍️ Customer Experience
- **Browse restaurants** and view detailed menus
- **Real-time cart** with special instructions
- **Multiple payment options** (Online/COD)
- **Order tracking** with live status updates
- **Order history** and reordering functionality

#### 💼 Sales Agent Portal
- **Subscription management** for hotel plans
- **Commission tracking** and payout history
- **Renewal automation** with email reminders
- **Performance analytics** and conversion metrics
- **Lead management** and follow-up system

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Shadcn/UI** components
- **Zustand** for state management
- **Socket.io Client** for real-time features

### Backend
- **Next.js API Routes**
- **Express.js** server
- **Socket.io** for real-time communication
- **MongoDB** with Mongoose ODM
- **JWT** for authentication

### Payment & External Services
- **Razorpay** payment gateway
- **Nodemailer** for email notifications
- **UUID** for unique identifiers

### Development Tools
- **ESLint** for code quality
- **TypeScript** compiler
- **Concurrently** for running multiple processes
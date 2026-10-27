import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// 1. Standard Mongoose Schema for MongoDB Atlas
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['student', 'educator', 'admin'],
      default: 'student',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving in Mongoose
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);

// 2. In-Memory fallback store for offline / local testing before MongoDB Atlas is linked
const memoryUsers = new Map();

class MemoryUserDoc {
  constructor(data) {
    this._id = data._id || crypto.randomUUID();
    this.name = data.name;
    this.email = (data.email || '').toLowerCase().trim();
    this.password = data.password;
    this.role = data.role || 'student';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  toObject() {
    return {
      _id: this._id,
      name: this.name,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

// Unified interface exported to controllers
export const User = {
  isAtlasConnected() {
    return mongoose.connection.readyState === 1;
  },

  async findOne(query) {
    if (this.isAtlasConnected()) {
      return await MongooseUser.findOne(query);
    }
    if (query.email) {
      const email = query.email.toLowerCase().trim();
      const match = Array.from(memoryUsers.values()).find((u) => u.email === email);
      return match || null;
    }
    return null;
  },

  async findById(id) {
    if (this.isAtlasConnected()) {
      return await MongooseUser.findById(id).select('-password');
    }
    const user = memoryUsers.get(String(id));
    if (!user) return null;
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  async create({ name, email, password, role }) {
    if (this.isAtlasConnected()) {
      return await MongooseUser.create({ name, email, password, role });
    }
    const cleanEmail = (email || '').toLowerCase().trim();
    const existing = Array.from(memoryUsers.values()).find((u) => u.email === cleanEmail);
    if (existing) {
      const err = new Error('Email is already registered');
      err.code = 11000;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const doc = new MemoryUserDoc({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: role || 'student',
    });

    memoryUsers.set(doc._id, doc);
    return doc;
  },

  async countDocuments() {
    if (this.isAtlasConnected()) {
      return await MongooseUser.countDocuments();
    }
    return memoryUsers.size;
  },
};

export default User;

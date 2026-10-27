import mongoose from 'mongoose';
import crypto from 'crypto';

// 1. Mongoose Schema for MongoDB Atlas
const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject category is required'],
      enum: {
        values: [
          'Computer Science',
          'Mathematics',
          'Physics',
          'Biology',
          'Chemistry',
          'Engineering',
          'Business',
          'Other',
        ],
        message: '{VALUE} is not a supported subject',
      },
    },
    resourceType: {
      type: String,
      required: [true, 'Resource type is required'],
      enum: {
        values: [
          'Notes',
          'Cheat Sheet',
          'Past Exam',
          'Textbook Guide',
          'Project Tutorial',
          'Video Lecture',
        ],
        message: '{VALUE} is not a supported resource type',
      },
    },
    link: {
      type: String,
      required: [true, 'Resource link / URL is required'],
      trim: true,
      match: [
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?(\?.*)?(#.*)?$/i,
        'Please enter a valid URL (e.g. https://example.com)',
      ],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    difficulty: {
      type: String,
      enum: ['Introductory', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    tags: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    creatorName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseResource =
  mongoose.models.Resource || mongoose.model('Resource', resourceSchema);

// 2. In-Memory fallback store for offline / local testing before MongoDB Atlas is linked
const memoryResources = new Map();

// Seed initial resources so the dashboard looks vibrant immediately
const seedInitialData = () => {
  if (memoryResources.size > 0) return;
  const initial = [
    {
      _id: 'seed-res-1',
      title: 'Full-Stack MERN Architecture Cheatsheet',
      subject: 'Computer Science',
      resourceType: 'Cheat Sheet',
      link: 'https://react.dev',
      description:
        'A comprehensive reference guide covering React Hooks, Express routing, MongoDB aggregation, and JWT auth flow patterns.',
      difficulty: 'Intermediate',
      tags: ['React', 'Node.js', 'MongoDB', 'JWT'],
      createdBy: 'system-demo-user',
      creatorName: 'StudySphere Curator',
      createdAt: new Date(Date.now() - 3600000 * 24 * 3),
      updatedAt: new Date(Date.now() - 3600000 * 24 * 3),
    },
    {
      _id: 'seed-res-2',
      title: 'Calculus III & Multivariable Formulas',
      subject: 'Mathematics',
      resourceType: 'Notes',
      link: 'https://tutorial.math.lamar.edu',
      description:
        'Detailed notes covering partial derivatives, double & triple integrals, Green’s Theorem, Stokes’ Theorem, and vector calculus.',
      difficulty: 'Advanced',
      tags: ['Calculus', 'Vectors', 'Formulas'],
      createdBy: 'system-demo-user',
      creatorName: 'Prof. Miller',
      createdAt: new Date(Date.now() - 3600000 * 24 * 5),
      updatedAt: new Date(Date.now() - 3600000 * 24 * 5),
    },
    {
      _id: 'seed-res-3',
      title: 'Algorithms & Data Structures: Final Exam Archive',
      subject: 'Computer Science',
      resourceType: 'Past Exam',
      link: 'https://leetcode.com/explore',
      description:
        'Past exam questions with solved solutions: Dijkstra, Dynamic Programming, Topological Sort, Red-Black Trees, and Big-O analysis.',
      difficulty: 'Advanced',
      tags: ['DSA', 'Algorithms', 'Past Exam'],
      createdBy: 'system-demo-user',
      creatorName: 'CS Alumni Guild',
      createdAt: new Date(Date.now() - 3600000 * 24 * 7),
      updatedAt: new Date(Date.now() - 3600000 * 24 * 7),
    },
    {
      _id: 'seed-res-4',
      title: 'Physics II: Electromagnetism & Optics Guide',
      subject: 'Physics',
      resourceType: 'Textbook Guide',
      link: 'https://openstax.org/details/books/university-physics-volume-2',
      description:
        'Maxwell’s Equations summary, Gauss’s Law walkthroughs, circuits with capacitors and inductors, and diffraction breakdown.',
      difficulty: 'Intermediate',
      tags: ['Physics', 'Electromagnetism', 'Optics'],
      createdBy: 'system-demo-user',
      creatorName: 'Physics TA Group',
      createdAt: new Date(Date.now() - 3600000 * 24 * 9),
      updatedAt: new Date(Date.now() - 3600000 * 24 * 9),
    },
  ];

  initial.forEach((item) => memoryResources.set(item._id, item));
};

seedInitialData();

export const Resource = {
  isAtlasConnected() {
    return mongoose.connection.readyState === 1;
  },

  async find(filter = {}) {
    if (this.isAtlasConnected()) {
      return await MongooseResource.find(filter).sort({ createdAt: -1 });
    }

    let items = Array.from(memoryResources.values());

    if (filter.subject && filter.subject !== 'All') {
      items = items.filter((r) => r.subject === filter.subject);
    }

    if (filter.resourceType && filter.resourceType !== 'All') {
      items = items.filter((r) => r.resourceType === filter.resourceType);
    }

    if (filter.createdBy) {
      items = items.filter((r) => String(r.createdBy) === String(filter.createdBy));
    }

    if (filter.$or && Array.isArray(filter.$or)) {
      // Basic text search regex simulation
      const regexes = filter.$or.map((cond) => {
        const key = Object.keys(cond)[0];
        const val = cond[key].$regex || cond[key];
        return { key, regex: new RegExp(val, 'i') };
      });

      items = items.filter((r) => {
        return regexes.some(({ key, regex }) => {
          if (key === 'tags') {
            return (r.tags || []).some((tag) => regex.test(tag));
          }
          return regex.test(r[key] || '');
        });
      });
    }

    // Sort descending by createdAt
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async findById(id) {
    if (this.isAtlasConnected()) {
      return await MongooseResource.findById(id);
    }
    return memoryResources.get(String(id)) || null;
  },

  async create(data) {
    if (this.isAtlasConnected()) {
      return await MongooseResource.create(data);
    }
    const doc = {
      _id: crypto.randomUUID(),
      title: data.title.trim(),
      subject: data.subject,
      resourceType: data.resourceType,
      link: data.link.trim(),
      description: data.description.trim(),
      difficulty: data.difficulty || 'Intermediate',
      tags: Array.isArray(data.tags) ? data.tags : [],
      createdBy: String(data.createdBy),
      creatorName: data.creatorName || 'Student',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryResources.set(doc._id, doc);
    return doc;
  },

  async findByIdAndUpdate(id, updates, options = {}) {
    if (this.isAtlasConnected()) {
      return await MongooseResource.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
        ...options,
      });
    }
    const existing = memoryResources.get(String(id));
    if (!existing) return null;

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    memoryResources.set(String(id), updated);
    return updated;
  },

  async findByIdAndDelete(id) {
    if (this.isAtlasConnected()) {
      return await MongooseResource.findByIdAndDelete(id);
    }
    const existing = memoryResources.get(String(id));
    if (!existing) return null;
    memoryResources.delete(String(id));
    return existing;
  },

  async countDocuments(filter = {}) {
    if (this.isAtlasConnected()) {
      return await MongooseResource.countDocuments(filter);
    }
    return memoryResources.size;
  },
};

export default Resource;

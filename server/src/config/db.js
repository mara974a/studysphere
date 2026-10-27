import mongoose from 'mongoose';
import { execSync } from 'child_process';

/**
 * Resolves Atlas SRV records directly if Node's internal c-ares DNS resolver times out
 */
const resolveSrvHosts = (rawUri) => {
  try {
    const match = rawUri.match(
      /^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)\/?([^?]*)\??(.*)$/
    );
    if (!match) return rawUri;

    const [, user, pass, host, db, query] = match;
    const output = execSync(
      `powershell.exe -NoProfile -Command "(Resolve-DnsName -Name _mongodb._tcp.${host} -Type SRV).NameTarget"`
    )
      .toString()
      .trim();

    const hosts = output
      .split(/\r?\n/)
      .map((h) => h.trim())
      .filter(Boolean)
      .map((h) => (h.includes(':') ? h : `${h}:27017`));

    if (hosts.length === 0) return rawUri;

    const baseQuery = query ? `&${query}` : '';
    return `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(
      pass
    )}@${hosts.join(',')}/${db || 'myapp'}?ssl=true&authSource=admin${baseQuery}`;
  } catch {
    return rawUri;
  }
};

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const isProduction = process.env.NODE_ENV === 'production';

  // 1. Strict production check
  if (!uri || uri.trim() === '' || uri.includes('<username>')) {
    if (isProduction) {
      console.error('❌ [Database] MONGODB_URI is strictly required in production.');
      process.exit(1);
    }

    console.log(
      'ℹ️ [Database] (Development Mode) No MONGODB_URI provided. Running in-memory store for offline development.'
    );
    return false;
  }

  // 2. Resolve URI if SRV lookup needs assistance
  let connectionUri = uri;
  if (uri.startsWith('mongodb+srv://') && process.platform === 'win32') {
    const resolved = resolveSrvHosts(uri);
    if (resolved && resolved !== uri) {
      connectionUri = resolved;
    }
  }

  // 3. Connect to MongoDB Atlas
  try {
    const conn = await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`===============================================`);
    console.log(`✅ [Database] MongoDB Atlas Connected!`);
    console.log(`🌐 Cluster Host: ${conn.connection.host}`);
    console.log(`📦 Database:     ${conn.connection.name}`);
    console.log(`⚡ Mode:         Atlas Cloud Database (NOT In-Memory)`);
    console.log(`===============================================`);
    return true;
  } catch (error) {
    console.error(`\n❌ [Database] Failed to connect to MongoDB Atlas:`);
    console.error(`   ${error.message}`);
    console.error(`\n⚠️  In-memory fallback is disabled because MONGODB_URI is configured.`);
    console.error(`\n👉 How to fix (Atlas IP Whitelist):`);
    console.error(`   1. Open MongoDB Atlas (https://cloud.mongodb.com)`);
    console.error(`   2. In the left sidebar under "Security", click "Network Access"`);
    console.error(`   3. Click "Add IP Address"`);
    console.error(`   4. Choose "Allow Access from Anywhere" (0.0.0.0/0) or add your current IP (169.150.196.107)`);
    console.error(`   5. Click "Confirm" and wait ~1 minute for Atlas to activate the rule.\n`);

    // Strictly exit without falling back to in-memory
    process.exit(1);
  }
};

export default connectDB;

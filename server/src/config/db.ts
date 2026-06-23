import mongoose from 'mongoose';

// Owns the Mongoose connection lifecycle. Event listeners give us visibility
// into connection state — important for diagnosing prod issues.
export async function connectDB(uri: string): Promise<typeof mongoose> {
  mongoose.connection.on('connected', () => console.log('✅ MongoDB connected'));
  mongoose.connection.on('error', (err) => console.error('❌ MongoDB error:', err.message));
  mongoose.connection.on('disconnected', () => console.log('⚠️  MongoDB disconnected'));

  await mongoose.connect(uri);
  return mongoose;
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}

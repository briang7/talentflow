import prisma from './prisma.service';

// Simplified auth service - in production, use Firebase Admin SDK
export async function getUserByFirebaseUid(firebaseUid: string) {
  return prisma.user.findUnique({
    where: { firebaseUid },
    include: { employee: true },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { employee: true },
  });
}

export async function createUser(data: { firebaseUid: string; email: string; role?: any }) {
  return prisma.user.create({
    data,
    include: { employee: true },
  });
}

export async function loginWithToken(firebaseToken: string) {
  // In production, verify with Firebase Admin SDK
  // For development, we'll accept a mock token format: "dev:email"
  let email: string;

  if (firebaseToken.startsWith('dev:')) {
    email = firebaseToken.substring(4);
  } else {
    // In production, verify with Firebase Admin SDK here
    throw new Error('Firebase token verification not implemented. Use dev:email@example.com format for development.');
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { employee: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Return a simple JWT-like token for development
  const token = Buffer.from(JSON.stringify({ userId: user.id, email: user.email, role: user.role })).toString('base64');

  return { token, user };
}

import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export const secret = "234fdsfdsfsdfdesrtewr"

const createUserInfoDB = async (payLoad: any) => {
    // Prepare user data
    const hashedPassword = await bcrypt.hash(payLoad.password, 10);
    
    const isProvider = payLoad.isProvider || false;
    
    try {
        // Use Prisma transaction with explicit timeout
        const result = await prisma.$transaction(
            async (tx) => {
                // Create user
                const user = await tx.user.create({
                    data: {
                        name: payLoad.name,
                        email: payLoad.email,
                        password: hashedPassword,
                        role: isProvider ? "PROVIDER" : "CUSTOMER",
                        status: "ACTIVE"
                    }
                });

                // If registering as provider, create provider profile
                if (isProvider) {
                    const providerProfile = await tx.providerProfiles.create({
                        data: {
                            userId: user.id,
                            restaurantName: payLoad.restaurantName,
                            address: payLoad.address,
                            phone: payLoad.phone
                        }
                    });

                    const { password, ...userWithoutPassword } = user;
                    return {
                        ...userWithoutPassword,
                        providerProfile: providerProfile
                    };
                }

                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            },
            {
                maxWait: 10000,  // 10 seconds to acquire a transaction slot
                timeout: 20000   // 20 seconds for the transaction to complete
            }
        );

        return result;
    } catch (error: any) {
        // If transaction fails, try without transaction as fallback
        if (error.message.includes("transaction")) {
            const hashedPasswordFallback = await bcrypt.hash(payLoad.password, 10);
            
            const user = await prisma.user.create({
                data: {
                    name: payLoad.name,
                    email: payLoad.email,
                    password: hashedPasswordFallback,
                    role: isProvider ? "PROVIDER" : "CUSTOMER",
                    status: "ACTIVE"
                }
            });

            if (isProvider) {
                const providerProfile = await prisma.providerProfiles.create({
                    data: {
                        userId: user.id,
                        restaurantName: payLoad.restaurantName,
                        address: payLoad.address,
                        phone: payLoad.phone
                    }
                });

                const { password, ...userWithoutPassword } = user;
                return {
                    ...userWithoutPassword,
                    providerProfile: providerProfile
                };
            }

            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        throw error;
    }
};

const loginUserDB = async (payLoad: any) => {
    const user = await prisma.user.findUnique({       
        where: { email: payLoad.email }
    });
    
    if (!user) {
        throw new Error("User not found");
    }
    
    const isPasswordValid = await bcrypt.compare(payLoad.password, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid password");
    }

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status
        },
        secret,
        { expiresIn: "1d" }
    );
    
    const { password, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
};

export const AuthService = {
    createUserInfoDB,
    loginUserDB
};
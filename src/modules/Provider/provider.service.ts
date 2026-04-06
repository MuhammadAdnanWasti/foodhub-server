import { prisma } from "../../lib/prisma";
const getAllProviders = async () => {
    const meals = await prisma.providerProfiles.findMany({
        include: {
            meals: true,
            user: true
        }
    });
    return meals;
};

const getProviderById = async (id: string) => {
    const provider = await prisma.providerProfiles.findUnique({
        where: { id },      
        include: {
            meals: true          

        }
    });
    return provider;
}
export const ProviderService = {
    // Add service methods here
    getProviderById,
    getAllProviders
    };
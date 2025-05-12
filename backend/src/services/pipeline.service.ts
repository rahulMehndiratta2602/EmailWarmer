import { logger } from '../utils/logger';
import { redisService } from './redis.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PipelineService {
    private static instance: PipelineService;

    private constructor() {}

    public static getInstance(): PipelineService {
        if (!PipelineService.instance) {
            PipelineService.instance = new PipelineService();
        }
        return PipelineService.instance;
    }

    private getCacheKey(id?: string): string {
        return id ? `pipeline:${id}` : 'pipelines:all';
    }

    async getAllPipelines() {
        try {
            // Try to get from cache first
            const cachedPipelines = await redisService.get(this.getCacheKey());
            if (cachedPipelines) {
                logger.debug('Returning pipelines from cache');
                return JSON.parse(cachedPipelines);
            }

            const pipelines = await prisma.pipeline.findMany({
                include: {
                    nodes: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            // Cache the results for future requests (expire after 1 hour)
            await redisService.set(this.getCacheKey(), JSON.stringify(pipelines), 3600);

            return pipelines;
        } catch (error) {
            logger.error('Error getting all pipelines:', error);
            throw error;
        }
    }

    async getPipelineById(id: string) {
        try {
            // Try to get from cache first
            const cachedPipeline = await redisService.get(this.getCacheKey(id));
            if (cachedPipeline) {
                logger.debug(`Returning pipeline ${id} from cache`);
                return JSON.parse(cachedPipeline);
            }

            const pipeline = await prisma.pipeline.findUnique({
                where: { id },
                include: {
                    nodes: true,
                },
            });

            if (pipeline) {
                // Cache the result for future requests (expire after 1 hour)
                await redisService.set(this.getCacheKey(id), JSON.stringify(pipeline), 3600);
            }

            return pipeline;
        } catch (error) {
            logger.error(`Error getting pipeline with id ${id}:`, error);
            throw error;
        }
    }

    async createPipeline(data: {
        name: string;
        nodes: { action: string; metadata?: Record<string, unknown> }[];
    }) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pipeline = await prisma.pipeline.create({
                data: {
                    name: data.name,
                    nodes: {
                        create: data.nodes.map((node) => ({
                            action: node.action,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            metadata: node.metadata as any,
                        })),
                    },
                },
                include: {
                    nodes: true,
                },
            });

            // Invalidate cache
            await redisService.delete(this.getCacheKey());

            return pipeline;
        } catch (error) {
            logger.error('Error creating pipeline:', error);
            throw error;
        }
    }

    async updatePipeline(
        id: string,
        data: { name: string; nodes: { action: string; metadata?: Record<string, unknown> }[] }
    ) {
        try {
            // First delete existing nodes
            await prisma.node.deleteMany({
                where: { pipelineId: id },
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pipeline = await prisma.pipeline.update({
                where: { id },
                data: {
                    name: data.name,
                    nodes: {
                        create: data.nodes.map((node) => ({
                            action: node.action,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            metadata: node.metadata as any,
                        })),
                    },
                },
                include: {
                    nodes: true,
                },
            });

            // Invalidate cache
            await redisService.delete(this.getCacheKey());
            await redisService.delete(this.getCacheKey(id));

            return pipeline;
        } catch (error) {
            logger.error(`Error updating pipeline with id ${id}:`, error);
            throw error;
        }
    }

    async deletePipeline(id: string): Promise<boolean> {
        try {
            await prisma.pipeline.delete({
                where: { id },
            });

            // Invalidate cache
            await redisService.delete(this.getCacheKey());
            await redisService.delete(this.getCacheKey(id));

            return true;
        } catch (error) {
            logger.error(`Error deleting pipeline with id ${id}:`, error);
            return false;
        }
    }
}

export const pipelineService = PipelineService.getInstance();

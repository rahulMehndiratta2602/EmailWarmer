import { Router } from 'express';
import { GoLoginService } from '../services/gologin.service';

const router = Router();

/**
 * @route   GET /api/gologin/profiles
 * @desc    Get all GoLogin profiles
 * @access  Private
 */
router.get('/profiles', async (req, res) => {
    try {
        const profiles = await GoLoginService.getProfiles();
        res.json(profiles);
    } catch (error) {
        console.error('Error getting GoLogin profiles:', error);
        res.status(500).json({
            error: 'Failed to fetch profiles',
            details: error instanceof Error ? error.message : String(error),
        });
    }
});

/**
 * @route   GET /api/gologin/profiles/:id
 * @desc    Get a specific GoLogin profile by ID
 * @access  Private
 */
router.get('/profiles/:id', async (req, res) => {
    try {
        const profileId = req.params.id;
        const profile = await GoLoginService.getProfileById(profileId);
        res.json(profile);
    } catch (error) {
        console.error(`Error getting GoLogin profile ${req.params.id}:`, error);
        res.status(500).json({
            error: 'Failed to fetch profile',
            details: error instanceof Error ? error.message : String(error),
        });
    }
});

/**
 * @route   DELETE /api/gologin/profiles/:id
 * @desc    Delete a GoLogin profile
 * @access  Private
 */
router.delete('/profiles/:id', async (req, res) => {
    try {
        const profileId = req.params.id;
        await GoLoginService.deleteProfile(profileId);
        res.json({ success: true, message: 'Profile deleted successfully' });
    } catch (error) {
        console.error(`Error deleting GoLogin profile ${req.params.id}:`, error);
        res.status(500).json({
            error: 'Failed to delete profile',
            details: error instanceof Error ? error.message : String(error),
        });
    }
});

/**
 * @route   DELETE /api/gologin/profiles
 * @desc    Batch delete multiple GoLogin profiles
 * @access  Private
 */
router.delete('/profiles', async (req, res) => {
    try {
        const profileIds = req.body.profileIds;

        if (!profileIds || !Array.isArray(profileIds) || profileIds.length === 0) {
            return res.status(400).json({
                error: 'Failed to delete profiles',
                details: 'A non-empty array of profileIds is required in the request body',
            });
        }

        console.log(`Attempting to batch delete ${profileIds.length} profiles:`, profileIds);

        // Delete profiles one by one
        const results = await Promise.allSettled(
            profileIds.map((id) => GoLoginService.deleteProfile(id))
        );

        // Count successes and failures
        const successes = results.filter((r) => r.status === 'fulfilled').length;
        const failures = results.filter((r) => r.status === 'rejected');

        // Log any failures
        if (failures.length > 0) {
            failures.forEach((failure, index) => {
                if (failure.status === 'rejected') {
                    console.error(`Failed to delete profile ${profileIds[index]}:`, failure.reason);
                }
            });
        }

        res.json({
            success: true,
            message: `${successes} profiles deleted successfully, ${failures.length} failed`,
            failedCount: failures.length,
            totalCount: profileIds.length,
        });
    } catch (error) {
        console.error('Error batch deleting GoLogin profiles:', error);
        res.status(500).json({
            error: 'Failed to batch delete profiles',
            details: error instanceof Error ? error.message : String(error),
        });
    }
});

/**
 * @route   DELETE /api/gologin/browser
 * @desc    Batch delete multiple GoLogin profiles using GoLogin's native API format
 * @access  Private
 */
router.delete('/browser', async (req, res) => {
    try {
        const profilesToDelete = req.body.profilesToDelete;

        if (
            !profilesToDelete ||
            !Array.isArray(profilesToDelete) ||
            profilesToDelete.length === 0
        ) {
            return res.status(400).json({
                error: 'Failed to delete profiles',
                details: 'A non-empty array of profilesToDelete is required in the request body',
            });
        }

        console.log(`Batch deleting GoLogin profiles:`, profilesToDelete);
        console.log('Sending batch delete request with body:', JSON.stringify(req.body));

        try {
            const result = await GoLoginService.batchDeleteProfiles(profilesToDelete);
            res.json(result);
        } catch (batchError) {
            console.error('Batch delete failed, attempting individual deletions:', batchError);

            // Fallback to deleting individually if batch delete fails
            const results = await Promise.allSettled(
                profilesToDelete.map((id) => GoLoginService.deleteProfile(id))
            );

            // Count successes and failures
            const successes = results.filter((r) => r.status === 'fulfilled').length;
            const failures = results.filter((r) => r.status === 'rejected');

            // Log any failures
            if (failures.length > 0) {
                failures.forEach((failure, index) => {
                    if (failure.status === 'rejected') {
                        console.error(
                            `Failed to delete profile ${profilesToDelete[index]}:`,
                            failure.reason
                        );
                    }
                });
            }

            res.json({
                success: successes > 0,
                message: `${successes} profiles deleted successfully, ${failures.length} failed (fallback mode)`,
                failedCount: failures.length,
                totalCount: profilesToDelete.length,
            });
        }
    } catch (error) {
        console.error('Error batch deleting GoLogin profiles:', error);
        res.status(500).json({
            error: 'Failed to delete profiles',
            details: error instanceof Error ? error.message : String(error),
        });
    }
});

/**
 * @route   POST /api/gologin/profiles
 * @desc    Create a new GoLogin profile
 * @access  Private
 */
router.post('/profiles', async (req, res) => {
    try {
        const newProfile = await GoLoginService.createProfile(req.body);
        res.status(201).json(newProfile);
    } catch (error) {
        console.error('Error creating GoLogin profile:', error);
        res.status(500).json({
            error: 'Failed to create profile',
            details: error instanceof Error ? error.message : String(error),
        });
    }
});

/**
 * @route   PUT /api/gologin/profiles/:id
 * @desc    Update a GoLogin profile
 * @access  Private
 */
router.put('/profiles/:id', async (req, res) => {
    try {
        const profileId = req.params.id;
        const updatedProfile = await GoLoginService.updateProfile(profileId, req.body);
        res.json(updatedProfile);
    } catch (error) {
        console.error(`Error updating GoLogin profile ${req.params.id}:`, error);
        res.status(500).json({
            error: 'Failed to update profile',
            details: error instanceof Error ? error.message : String(error),
        });
    }
});

/**
 * @route   POST /api/gologin/profiles/custom
 * @desc    Create a new custom GoLogin profile using the browser/custom endpoint
 * @access  Private
 */
router.post('/profiles/custom', async (req, res) => {
    try {
        console.log('Received request to create custom profile');
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        // Ensure required fields are present
        if (!req.body.name) {
            return res.status(400).json({
                error: 'Failed to create profile',
                details: 'Profile name is required',
            });
        }

        if (!req.body.os) {
            return res.status(400).json({
                error: 'Failed to create profile',
                details: 'Operating system (os) is required',
            });
        }

        // Ensure webglParams is present
        if (!req.body.webglParams) {
            console.log('Adding missing webglParams field');
            req.body.webglParams = {
                glCanvas: 'webgl2',
                supportedFunctions: [{ name: 'beginQuery', supported: true }],
                glParamValues: [{ name: 'ALIASED_LINE_WIDTH_RANGE', value: { '0': 1, '1': 8 } }],
                antialiasing: true,
                textureMaxAnisotropyExt: 16,
                shaiderPrecisionFormat: 'highp/highp',
                extensions: ['EXT_color_buffer_float'],
            };
        }

        // Ensure chromeExtensions is present (at least as empty array)
        if (!req.body.chromeExtensions) {
            console.log('Adding missing chromeExtensions field');
            req.body.chromeExtensions = [];
        }

        // Create the profile
        const newProfile = await GoLoginService.createProfile(req.body);
        console.log('Profile created successfully:', JSON.stringify(newProfile, null, 2));
        res.status(201).json(newProfile);
    } catch (error: unknown) {
        console.error('Error creating custom GoLogin profile:', error);

        // Check if error is an axios error with response property
        const axiosError = error as {
            response?: {
                status: number;
                data: Record<string, unknown>;
            };
        };
        if (axiosError.response) {
            console.error('Response status:', axiosError.response.status);
            console.error('Response data:', JSON.stringify(axiosError.response.data, null, 2));
        }

        res.status(500).json({
            error: 'Failed to create profile',
            details: error instanceof Error ? error.message : String(error),
        });
    }
});

export default router;

const fs = require('fs').promises;
const pLimit = require('p-limit');
const ConfigLoader = require('./config');
const YardService = require('./services/yard');
const { ENV_CONFIG } = require('./constants');

class Application {
    constructor() {
        this.configLoader = new ConfigLoader();
        this.yardService = new YardService();
        this.limit = pLimit.default(ENV_CONFIG.CONCURRENCY.LIMIT);
    }

    async processBrands(brands) {
        console.log(`Processing ${brands.length} brands...`);
        
        const results = await Promise.all(
            brands.map((brand, index) =>
                this.limit(async () => {
                    console.log(`Fetching ${brand.name}...`);
                    
                    try {
                        const result = await this.yardService.getAvailableYardsForBrand(
                            brand,
                            index === 0
                        );
                        
                        console.log(`✓ Completed ${brand.name}`);
                        return result.display;
                    } catch (error) {
                        console.error(`✗ Failed ${brand.name}:`, error.message);
                        return `Error processing ${brand.name}: ${error.message}\n`;
                    }
                })
            )
        );
        
        return results;
    }

    async run(outputFile = 'output.txt') {
        try {
            console.log('Starting yard booking application...');
            
            const brands = this.configLoader.loadBrands();
            
            if (!brands || brands.length === 0) {
                throw new Error('No brands found in configuration');
            }
            
            console.log(`Loaded ${brands.length} brands from configuration`);
            
            const results = await this.processBrands(brands);
            
            const output = results.join('');
            await fs.writeFile(outputFile, output, 'utf8');
            
            console.log(`\n✓ Results written to ${outputFile}`);
            console.log(`✓ Processed ${results.length} brands successfully`);
            
            return {
                success: true,
                brandsProcessed: results.length,
                outputFile
            };
        } catch (error) {
            console.error('Application failed:', error);
            throw error;
        }
    }

    async runSingleBrand(brandId, outputFile = null) {
        try {
            const brand = this.configLoader.getBrandById(brandId);
            
            if (!brand) {
                throw new Error(`Brand with ID ${brandId} not found`);
            }
            
            console.log(`Processing brand: ${brand.name}`);
            
            const result = await this.yardService.getAvailableYardsForBrand(brand, true);
            
            if (outputFile) {
                await fs.writeFile(outputFile, result.display, 'utf8');
                console.log(`✓ Results written to ${outputFile}`);
            }
            
            return result;
        } catch (error) {
            console.error(`Failed to process brand ${brandId}:`, error);
            throw error;
        }
    }

    async runByFilter(filterOptions = {}, outputFile = 'output.txt') {
        try {
            let brands = this.configLoader.loadBrands();
            
            if (filterOptions.type) {
                brands = brands.filter(b => b.type === filterOptions.type);
            }
            
            if (filterOptions.provinceId) {
                brands = brands.filter(b => b.provinceId === filterOptions.provinceId);
            }
            
            if (filterOptions.status !== undefined) {
                brands = brands.filter(b => b.status === filterOptions.status);
            }
            
            if (brands.length === 0) {
                throw new Error('No brands match the specified filters');
            }
            
            console.log(`Found ${brands.length} brands matching filters`);
            
            const results = await this.processBrands(brands);
            
            const output = results.join('');
            await fs.writeFile(outputFile, output, 'utf8');
            
            console.log(`✓ Results written to ${outputFile}`);
            
            return {
                success: true,
                brandsProcessed: results.length,
                outputFile
            };
        } catch (error) {
            console.error('Failed to run with filters:', error);
            throw error;
        }
    }
}

module.exports = Application;
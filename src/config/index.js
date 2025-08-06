const fs = require('fs');
const path = require('path');

class ConfigLoader {
    constructor(configPath = null) {
        this.configPath = configPath || path.join(process.cwd(), 'branchs.json');
        this.brands = null;
    }

    loadBrands() {
        if (this.brands) {
            return this.brands;
        }

        try {
            const configContent = fs.readFileSync(this.configPath, 'utf8');
            this.brands = JSON.parse(configContent);
            return this.brands;
        } catch (error) {
            console.error(`Failed to load brands configuration from ${this.configPath}:`, error);
            throw new Error(`Configuration file not found or invalid: ${this.configPath}`);
        }
    }

    getBrandById(brandId) {
        const brands = this.loadBrands();
        return brands.find(brand => brand.id === brandId);
    }

    getBrandsByType(type) {
        const brands = this.loadBrands();
        return brands.filter(brand => brand.type === type);
    }

    getBrandsByProvince(provinceId) {
        const brands = this.loadBrands();
        return brands.filter(brand => brand.provinceId === provinceId);
    }

    getActiveBrands() {
        const brands = this.loadBrands();
        return brands.filter(brand => brand.status === 1);
    }

    reload() {
        this.brands = null;
        return this.loadBrands();
    }
}

module.exports = ConfigLoader;
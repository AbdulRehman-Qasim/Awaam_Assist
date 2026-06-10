/**
 * Robust fee parsing utility to handle various formats:
 * - "40000" -> 40000
 * - "PKR 40,000/sem" -> 40000
 * - "PKR 300,000/yr" -> 300000
 * - "N/A" -> 0
 * - null/undefined -> 0
 */
const parseFee = (fee) => {
    if (fee === null || fee === undefined || fee === '') return 0;
    if (typeof fee === 'number') return fee;
    
    // Remove currency symbols, commas, spaces, and suffixes
    const cleaned = String(fee)
        .replace(/PKR/gi, '')
        .replace(/,/g, '')
        .replace(/\//g, ' ')
        .replace(/sem/gi, '')
        .replace(/yr/gi, '')
        .replace(/year/gi, '')
        .replace(/semester/gi, '')
        .trim();
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
};

/**
 * Normalizes a fee for comparison.
 * If it's a semester fee, it returns it as is (comparison usually happens against input budget).
 * The user input is "Max Fee Budget (PKR)". We don't know if they mean per semester or per year,
 * but usually users enter their per-payment budget.
 */
const normalizeFeeValue = (value) => {
    return parseFee(value);
};

module.exports = {
    parseFee,
    normalizeFeeValue
};

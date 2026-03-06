import { Request, Response } from 'express';
import Entry from '../models/entryModel';
import Criteria from '../models/criteriaModel';
import Config from '../models/configModel';
import CalculationResult from '../models/calculatorResult';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { ICalculationRequest, ICalculationResponse, ICriteriaResult } from '../type/index';

const getRiskLevel = (averageScore: number): string => {
  // Based on the resilience table from the image.
  if (averageScore >= 3) {
    return 'Totally resilient. Project can sustain major impacts without any damage or only minor damage, not affecting service capacity. Or the project is not subject to the risk.';
  } else if (averageScore >= 2) {
    return 'Resilient. Project may support major impacts but would require some repairs.';
  } else if (averageScore >= 1) {
    return 'Slightly resilient. Project may support minor impact but can be seriously affected by a major impact, requiring significant repairs.';
  } else {
    return 'Not resilient. Occurrence of the hazard would turn the project useless and require rebuilding.';
  }
};

const getRiskLevelShort = (averageScore: number): string => {
  if (averageScore >= 3) {
    return 'Totally resilient';
  } else if (averageScore >= 2) {
    return 'Resilient';
  } else if (averageScore >= 1) {
    return 'Slightly resilient';
  } else {
    return 'Not resilient';
  }
};

// Division-Wide Calculation
export const calculateDivisionHazard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { division } = req.params;
    
    console.log(`Calculating for division: ${division}`);
    
    // Get all entries for this division
    const entries = await Entry.find({ division });
    
    console.log(`Found ${entries.length} entries`);
    
    if (entries.length === 0) {
      res.status(404).json({ success: false, message: `No entries found for division: ${division}` });
      return;
    }
    
    // Initialize counters
    let sumOfAllCriteriaValues = 0;  // Sum of ALL criteria values
    let totalCriteriaCount = 0;       // Total count of ALL criteria
    const entryResults: any[] = [];
    
    // Loop through each entry in the division
    for (const entry of entries) {
      const criteria = await Criteria.find({ entryId: entry._id });
      
      console.log(`Entry ${entry.climateHazardCategory}: ${criteria.length} criteria`);
      
      if (criteria.length === 0) {
        // Include entry even with no criteria
        entryResults.push({
          entryId: entry._id,
          climateHazardCategory: entry.climateHazardCategory,
          criteriaResults: [],
          totalScore: 0,
          averageScore: 0,
          riskLevel: 'No Data',
          riskLevelShort: 'No Data',
          criteriaCount: 0
        });
        continue;
      }
      
      let entryTotalScore = 0;
      const criteriaResults: ICriteriaResult[] = [];
      
      // Loop through each criteria in the entry
      for (const criterion of criteria) {
        // Find config by the weight value stored in criteria
        const config = await Config.findOne({ value: criterion.weight });
        
        console.log(`Criteria ${criterion.criteriaTitle}: weight=${criterion.weight}, config found=${!!config}`);
        
        if (!config) {
          console.warn(`No config found for weight value: ${criterion.weight}`);
          // Use the weight value directly if no config found
          entryTotalScore += criterion.weight;
          sumOfAllCriteriaValues += criterion.weight;  // Add to division sum
          totalCriteriaCount += 1;                      // Increment count
          
          criteriaResults.push({
            criteriaId: criterion._id,
            criteriaTitle: criterion.criteriaTitle,
            selectedConfig: `Value: ${criterion.weight}`,
            configValue: criterion.weight
          });
        } else {
          // Config found, use it
          entryTotalScore += config.value;
          sumOfAllCriteriaValues += config.value;  // Add to division sum
          totalCriteriaCount += 1;                  // Increment count
          
          criteriaResults.push({
            criteriaId: criterion._id,
            criteriaTitle: criterion.criteriaTitle,
            selectedConfig: config.name,
            configValue: config.value
          });
        }
      }
      
      // Calculate entry-specific scores
      // Formula: (Sum of entry criteria / Criteria count) × 3
      const entryAverageBeforeMultiplier = criteria.length > 0 ? entryTotalScore / criteria.length : 0;
      const entryAverageScore = entryAverageBeforeMultiplier * 3;  // Multiply by 3
      const entryRiskLevel = criteria.length > 0 ? getRiskLevel(entryAverageScore) : 'No Data';
      const entryRiskLevelShort = criteria.length > 0 ? getRiskLevelShort(entryAverageScore) : 'No Data';
      
      entryResults.push({
        entryId: entry._id,
        climateHazardCategory: entry.climateHazardCategory,
        criteriaResults,
        totalScore: parseFloat(entryTotalScore.toFixed(2)),
        averageScore: parseFloat(entryAverageScore.toFixed(2)),
        riskLevel: entryRiskLevel,
        riskLevelShort: entryRiskLevelShort,
        criteriaCount: criteria.length
      });
    }
    
    if (totalCriteriaCount === 0) {
      res.status(400).json({ 
        success: false, 
        message: 'No criteria found for any entries in this division. Please add criteria to at least one entry.' 
      });
      return;
    }
    
    console.log(`Total criteria: ${totalCriteriaCount}, Sum: ${sumOfAllCriteriaValues}`);
    
    // FORMULA: (Sum of all criteria values / Total criteria count) × 3
    const divisionAverageScore = (sumOfAllCriteriaValues / totalCriteriaCount) * 3;
    const divisionRiskLevel = getRiskLevel(divisionAverageScore);
    const divisionRiskLevelShort = getRiskLevelShort(divisionAverageScore);
    
    const result = {
      division,
      entryCount: entries.length,
      totalCriteriaCount,
      sumOfAllCriteriaValues: parseFloat(sumOfAllCriteriaValues.toFixed(2)),
      divisionAverageScore: parseFloat(divisionAverageScore.toFixed(2)),
      divisionRiskLevel,
      divisionRiskLevelShort,
      entryResults,
      calculatedDate: new Date()
    };
    
    console.log('Calculation successful:', result);
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Division calculation error:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error during calculation' 
    });
  }
};

export const generateDivisionPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const divisionData = req.body;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2c3e50; padding-bottom: 20px; }
          .header h1 { color: #2c3e50; margin: 0 0 10px 0; font-size: 28px; }
          .header p { color: #7f8c8d; margin: 5px 0; font-size: 14px; }
          .division-name { background: #3498db; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 18px; }
          .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 30px 0; }
          .summary-card { background: #ecf0f1; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #bdc3c7; }
          .summary-card h3 { margin: 0 0 10px 0; font-size: 12px; color: #7f8c8d; text-transform: uppercase; letter-spacing: 1px; }
          .summary-card p { margin: 0; font-size: 32px; font-weight: bold; color: #2c3e50; }
          .summary-card.blue { background: #e3f2fd; border-color: #2196f3; }
          .summary-card.blue h3 { color: #1976d2; }
          .summary-card.blue p { color: #0d47a1; }
          .summary-card.purple { background: #f3e5f5; border-color: #9c27b0; }
          .summary-card.purple h3 { color: #7b1fa2; }
          .summary-card.purple p { color: #4a148c; }
          .summary-card.orange { background: #fff3e0; border-color: #ff9800; }
          .summary-card.orange h3 { color: #f57c00; }
          .summary-card.orange p { color: #e65100; }
          .summary-card.green { background: #e8f5e9; border-color: #4caf50; }
          .summary-card.green h3 { color: #388e3c; }
          .summary-card.green p { color: #1b5e20; }
          .formula { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .formula h3 { margin: 0 0 15px 0; color: #856404; font-size: 16px; }
          .formula p { margin: 8px 0; font-size: 14px; color: #333; }
          .formula .calculation { font-family: 'Courier New', monospace; background: white; padding: 10px; border-radius: 3px; margin-top: 10px; font-size: 16px; font-weight: bold; color: #856404; }
          .entry-section { margin: 30px 0; }
          .entry-section h2 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-bottom: 20px; font-size: 20px; }
          .entry-card { background: #fff; border: 2px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
          .entry-card h3 { margin: 0 0 15px 0; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; font-size: 16px; }
          .risk-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 11px; text-transform: uppercase; }
          .risk-totally { background: #27ae60; color: white; }
          .risk-resilient { background: #3498db; color: white; }
          .risk-slightly { background: #f39c12; color: white; }
          .risk-not { background: #e74c3c; color: white; }
          .risk-no-data { background: #95a5a6; color: white; }
          .criteria-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .criteria-table th { background-color: #34495e; color: white; padding: 10px; text-align: left; font-size: 12px; font-weight: bold; }
          .criteria-table td { padding: 8px 10px; border-bottom: 1px solid #ddd; font-size: 12px; }
          .criteria-table tbody tr:hover { background-color: #f8f9fa; }
          .criteria-table tbody tr:nth-child(even) { background-color: #fafafa; }
          .entry-summary { background: #f8f9fa; padding: 12px; border-radius: 5px; margin-top: 10px; display: flex; justify-content: space-between; font-size: 12px; }
          .entry-summary span { color: #555; }
          .entry-summary strong { color: #2c3e50; }
          .risk-description { background: #e8f5e9; border-left: 4px solid #27ae60; padding: 15px; margin: 15px 0; border-radius: 5px; font-size: 13px; line-height: 1.6; }
          .risk-description.not { background: #ffebee; border-color: #e74c3c; }
          .risk-description.slightly { background: #fff3e0; border-color: #f39c12; }
          .risk-description.resilient { background: #e3f2fd; border-color: #3498db; }
          .risk-description.totally { background: #e8f5e9; border-color: #27ae60; }
          .division-result { background: linear-gradient(to right, #e8f5e9, #e3f2fd); border: 3px solid #4caf50; border-radius: 10px; padding: 30px; margin: 30px 0; text-align: center; page-break-inside: avoid; }
          .division-result h2 { color: #2e7d32; margin: 0 0 20px 0; font-size: 22px; }
          .division-result .score-row { margin: 10px 0; font-size: 16px; color: #333; }
          .final-risk { font-size: 36px; font-weight: bold; margin: 20px 0; padding: 20px; background: white; border-radius: 10px; text-transform: uppercase; letter-spacing: 2px; }
          .final-risk.totally { color: #27ae60; border: 3px solid #27ae60; }
          .final-risk.resilient { color: #3498db; border: 3px solid #3498db; }
          .final-risk.slightly { color: #f39c12; border: 3px solid #f39c12; }
          .final-risk.not { color: #e74c3c; border: 3px solid #e74c3c; }
          .footer { margin-top: 50px; text-align: center; color: #7f8c8d; border-top: 2px solid #bdc3c7; padding-top: 20px; font-size: 12px; }
          .footer p { margin: 5px 0; }
          @media print {
            body { padding: 20px; }
            .entry-card, .division-result { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Climate Hazard Resilience Assessment</h1>
          <p>Bangladesh Climate Risk Analysis</p>
          <p class="division-name">${divisionData.division}</p>
        </div>
        
        <div class="summary">
          <div class="summary-card blue">
            <h3>Total Entries</h3>
            <p>${divisionData.entryCount}</p>
          </div>
          <div class="summary-card purple">
            <h3>Total Criteria</h3>
            <p>${divisionData.totalCriteriaCount}</p>
          </div>
          <div class="summary-card orange">
            <h3>Sum of Values</h3>
            <p>${divisionData.sumOfAllCriteriaValues.toFixed(2)}</p>
          </div>
          <div class="summary-card green">
            <h3>Average Score</h3>
            <p>${divisionData.divisionAverageScore.toFixed(2)}</p>
          </div>
        </div>
        
        <div class="formula">
          <h3>📊 Calculation Formula</h3>
          <p><strong>Sum of All Criteria Values:</strong> ${divisionData.sumOfAllCriteriaValues.toFixed(2)}</p>
          <p><strong>Total Criteria Count:</strong> ${divisionData.totalCriteriaCount}</p>
          <div class="calculation">
            Average Score = (${divisionData.sumOfAllCriteriaValues.toFixed(2)} ÷ ${divisionData.totalCriteriaCount}) × 3 = ${divisionData.divisionAverageScore.toFixed(2)}
          </div>
        </div>
        
        <div class="entry-section">
          <h2>Detailed Entry Assessments (${divisionData.entryResults.length} Entries)</h2>
          ${divisionData.entryResults.map((entry: any) => `
            <div class="entry-card">
              <h3>
                <span>${entry.climateHazardCategory}</span>
                <span class="risk-badge ${
                  entry.riskLevelShort === 'Totally resilient' ? 'risk-totally' : 
                  entry.riskLevelShort === 'Resilient' ? 'risk-resilient' : 
                  entry.riskLevelShort === 'Slightly resilient' ? 'risk-slightly' :
                  entry.riskLevelShort === 'Not resilient' ? 'risk-not' : 'risk-no-data'
                }">${entry.riskLevelShort || 'No Data'}</span>
              </h3>
              
              ${entry.criteriaResults.length > 0 ? `
                <table class="criteria-table">
                  <thead>
                    <tr>
                      <th style="width: 50%;">Criteria</th>
                      <th style="width: 30%;">Resilience Level</th>
                      <th style="width: 20%; text-align: center;">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${entry.criteriaResults.map((cr: any) => `
                      <tr>
                        <td>${cr.criteriaTitle}</td>
                        <td>${cr.selectedConfig}</td>
                        <td style="text-align: center; font-weight: bold;">${cr.configValue}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                
                <div class="entry-summary">
                  <span><strong>Entry Total:</strong> ${entry.totalScore.toFixed(2)}</span>
                  <span><strong>Entry Average:</strong> ${entry.averageScore.toFixed(2)}</span>
                  <span><strong>Criteria Count:</strong> ${entry.criteriaCount}</span>
                </div>
                
                <div class="risk-description ${
                  entry.riskLevelShort === 'Totally resilient' ? 'totally' : 
                  entry.riskLevelShort === 'Resilient' ? 'resilient' : 
                  entry.riskLevelShort === 'Slightly resilient' ? 'slightly' : 'not'
                }">
                  <strong>Assessment:</strong> ${entry.riskLevel || 'No data available'}
                </div>
              ` : `
                <p style="color: #999; font-style: italic; text-align: center; padding: 20px; font-size: 13px;">No criteria data available for this entry</p>
              `}
            </div>
          `).join('')}
        </div>
        
        <div class="division-result">
          <h2>Division-Wide Assessment Results</h2>
          <div class="score-row">
            <strong>Sum of All Criteria Values:</strong> ${divisionData.sumOfAllCriteriaValues.toFixed(2)}
          </div>
          <div class="score-row">
            <strong>Total Criteria Count:</strong> ${divisionData.totalCriteriaCount}
          </div>
          <div class="score-row">
            <strong>Division Average Score:</strong> ${divisionData.divisionAverageScore.toFixed(2)}
          </div>
          
          <div class="final-risk ${
            divisionData.divisionRiskLevelShort === 'Totally resilient' ? 'totally' : 
            divisionData.divisionRiskLevelShort === 'Resilient' ? 'resilient' : 
            divisionData.divisionRiskLevelShort === 'Slightly resilient' ? 'slightly' : 'not'
          }">
            ${divisionData.divisionRiskLevelShort || 'No Data'}
          </div>
          
          <div class="risk-description ${
            divisionData.divisionRiskLevelShort === 'Totally resilient' ? 'totally' : 
            divisionData.divisionRiskLevelShort === 'Resilient' ? 'resilient' : 
            divisionData.divisionRiskLevelShort === 'Slightly resilient' ? 'slightly' : 'not'
          }" style="text-align: left; margin-top: 20px;">
            <strong>Overall Assessment:</strong><br>
            ${divisionData.divisionRiskLevel || 'No data available'}
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Climate Hazard Resilience Calculator - Bangladesh</strong></p>
          <p>Points Awarded Based on Project Resilience to Climate Change (CC) Induced Hazards</p>
          <p>Generated on ${new Date().toLocaleString('en-GB', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          })}</p>
          <p>Division: ${divisionData.division} | Entries: ${divisionData.entryCount} | Total Criteria: ${divisionData.totalCriteriaCount}</p>
        </div>
      </body>
      </html>
    `;
    
    // Launch puppeteer
    const browser = await puppeteer.launch({ 
      headless: 'new', 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Create PDF directory if not exists
    const pdfDir = path.join(__dirname, '../../public/pdfs');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }
    
    // Generate unique filename
    const filename = `division-${divisionData.division.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
    const filepath = path.join(pdfDir, filename);
    
    // Generate PDF with proper settings
    await page.pdf({ 
      path: filepath, 
      format: 'A4', 
      printBackground: true,
      margin: { 
        top: '20px', 
        right: '20px', 
        bottom: '20px', 
        left: '20px' 
      }
    });
    
    await browser.close();
    
    const pdfUrl = `/pdfs/${filename}`;
    
    console.log(`PDF generated successfully: ${pdfUrl}`);
    
    res.json({ 
      success: true, 
      data: { pdfUrl } 
    });
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error during PDF generation' 
    });
  }
};

export const getCalculationHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const history = await CalculationResult.find().populate('entryId').sort({ calculatedDate: -1 });
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getCalculationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const calculation = await CalculationResult.findById(id).populate('entryId');
    if (!calculation) {
      res.status(404).json({ success: false, message: 'Calculation not found' });
      return;
    }
    res.json({ success: true, data: calculation });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};
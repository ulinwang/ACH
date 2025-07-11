import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCheck, Download, Eye, Edit3, Save, Share2, Printer, FileText, BarChart3, Calendar, Settings } from 'lucide-react';
import { useAnalysisStore } from '../../store/analysisStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ReportSection {
    id: string;
    title: string;
    content: string;
    enabled: boolean;
    order: number;
}

interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    sections: ReportSection[];
    isDefault: boolean;
}

interface ReportHistory {
    id: string;
    title: string;
    template: string;
    createdAt: Date;
    size: string;
    format: string;
}

export const Step7Report: React.FC = () => {
    const { data } = useAnalysisStore();
    const [selectedTab, setSelectedTab] = useState('generate');
    const [reportTitle, setReportTitle] = useState(`${data.title} - ACH分析报告`);
    const [reportFormat, setReportFormat] = useState('html');
    const [selectedTemplate, setSelectedTemplate] = useState('comprehensive');
    const [customSections, setCustomSections] = useState<ReportSection[]>([]);
    const [reportHistory, setReportHistory] = useState<ReportHistory[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    const getMatrixScore = (hypothesisId: string, evidenceId: string): number => {
        const key = `${hypothesisId}-${evidenceId}`;
        return data.matrix[key] || 0;
    };

    const calculateHypothesisScore = (hypothesis: any) => {
        const scores = data.evidence.map(evidence => {
            const score = getMatrixScore(hypothesis.id, evidence.id);
            const weightedScore = score * (evidence.weight / 100) * (evidence.reliability / 100);
            return weightedScore;
        });

        const totalScore = scores.reduce((sum, score) => sum + score, 0);
        const count = scores.filter(score => score !== 0).length;
        const average = count > 0 ? totalScore / count : 0;

        return {
            raw: totalScore,
            weighted: totalScore,
            average,
            count,
            scores
        };
    };

    const rankedHypotheses = useMemo(() => {
        return data.hypotheses
            .map(hypothesis => ({
                ...hypothesis,
                score: calculateHypothesisScore(hypothesis)
            }))
            .sort((a, b) => b.score.weighted - a.score.weighted);
    }, [data.hypotheses, data.evidence, data.matrix]);

    // 报告模板
    const reportTemplates: ReportTemplate[] = [
        {
            id: 'comprehensive',
            name: '综合报告',
            description: '包含所有分析步骤的完整报告',
            isDefault: true,
            sections: [
                { id: 'executive', title: '执行摘要', content: '', enabled: true, order: 1 },
                { id: 'background', title: '背景信息', content: '', enabled: true, order: 2 },
                { id: 'methodology', title: '分析方法', content: '', enabled: true, order: 3 },
                { id: 'hypotheses', title: '假设清单', content: '', enabled: true, order: 4 },
                { id: 'evidence', title: '证据清单', content: '', enabled: true, order: 5 },
                { id: 'matrix', title: '分析矩阵', content: '', enabled: true, order: 6 },
                { id: 'conclusions', title: '分析结论', content: '', enabled: true, order: 7 },
                { id: 'sensitivity', title: '敏感性分析', content: '', enabled: true, order: 8 },
                { id: 'recommendations', title: '建议', content: '', enabled: true, order: 9 },
                { id: 'limitations', title: '局限性', content: '', enabled: true, order: 10 }
            ]
        },
        {
            id: 'executive',
            name: '执行摘要',
            description: '面向决策者的简洁版本',
            isDefault: false,
            sections: [
                { id: 'executive', title: '执行摘要', content: '', enabled: true, order: 1 },
                { id: 'conclusions', title: '主要结论', content: '', enabled: true, order: 2 },
                { id: 'recommendations', title: '建议', content: '', enabled: true, order: 3 }
            ]
        },
        {
            id: 'technical',
            name: '技术报告',
            description: '面向技术专家的详细版本',
            isDefault: false,
            sections: [
                { id: 'methodology', title: '分析方法', content: '', enabled: true, order: 1 },
                { id: 'hypotheses', title: '假设清单', content: '', enabled: true, order: 2 },
                { id: 'evidence', title: '证据清单', content: '', enabled: true, order: 3 },
                { id: 'matrix', title: '分析矩阵', content: '', enabled: true, order: 4 },
                { id: 'sensitivity', title: '敏感性分析', content: '', enabled: true, order: 5 },
                { id: 'limitations', title: '局限性', content: '', enabled: true, order: 6 }
            ]
        }
    ];

    // 生成报告内容
    const generateReportContent = () => {
        const template = reportTemplates.find(t => t.id === selectedTemplate);
        if (!template) return '';

        const sections = template.sections.filter(s => s.enabled).sort((a, b) => a.order - b.order);

        let content = '';

        sections.forEach(section => {
            content += `\n\n## ${section.title}\n\n`;

            switch (section.id) {
                case 'executive':
                    content += generateExecutiveSummary();
                    break;
                case 'background':
                    content += generateBackground();
                    break;
                case 'methodology':
                    content += generateMethodology();
                    break;
                case 'hypotheses':
                    content += generateHypothesesSection();
                    break;
                case 'evidence':
                    content += generateEvidenceSection();
                    break;
                case 'matrix':
                    content += generateMatrixSection();
                    break;
                case 'conclusions':
                    content += generateConclusionsSection();
                    break;
                case 'sensitivity':
                    content += generateSensitivitySection();
                    break;
                case 'recommendations':
                    content += generateRecommendations();
                    break;
                case 'limitations':
                    content += generateLimitations();
                    break;
            }
        });

        return content;
    };

    const generateExecutiveSummary = () => {
        const topHypothesis = rankedHypotheses[0];
        const totalCells = data.hypotheses.length * data.evidence.length;
        const filledCells = Object.keys(data.matrix).length;
        const completionRate = totalCells > 0 ? (filledCells / totalCells) * 100 : 0;

        return `
本报告采用"分析竞争假设"(ACH)方法，对"${data.title}"进行了系统性分析。

**主要发现：**
- 分析了${data.hypotheses.length}个假设和${data.evidence.length}个证据
- 矩阵完成度为${completionRate.toFixed(1)}%
- 最可能的假设为：${topHypothesis?.text || 'N/A'}
- 该假设的综合得分为${topHypothesis?.score.weighted.toFixed(2) || 'N/A'}

**关键结论：**
基于当前证据和分析，${topHypothesis?.text || '暂无明确结论'}是最符合现有证据的假设。${rankedHypotheses.length > 1 ? `与第二名假设相比，得分差距为${(rankedHypotheses[0].score.weighted - rankedHypotheses[1].score.weighted).toFixed(2)}分。` : ''}

**建议：**
1. 进一步收集和验证关键证据
2. 定期更新分析结果
3. 考虑其他分析方法进行交叉验证
        `.trim();
    };

    const generateBackground = () => {
        return `
**分析主题：** ${data.title}

**分析目的：** 
通过系统性的竞争假设分析，评估各种可能的解释或假设，识别最符合现有证据的假设。

**分析范围：**
- 假设数量：${data.hypotheses.length}个
- 证据数量：${data.evidence.length}个
- 分析时间：${new Date().toLocaleDateString()}

**分析方法：**
采用"分析竞争假设"(Analysis of Competing Hypotheses, ACH)方法，这是一种结构化的分析技术，通过系统性地评估证据对各个假设的支持程度来提高分析质量。
        `.trim();
    };

    const generateMethodology = () => {
        return `
**ACH分析方法包括以下步骤：**

1. **假设识别：** 列出所有可能的假设，确保覆盖主要的可能性
2. **证据收集：** 收集与假设相关的证据，评估其权重和可靠性
3. **矩阵构建：** 构建假设-证据矩阵，评估每个证据对各假设的支持程度
4. **矩阵精简：** 识别和移除低价值证据，合并相似假设
5. **结论生成：** 基于矩阵分析结果，得出最可能的假设
6. **敏感性分析：** 评估结论的稳定性和对关键假设的敏感性

**评分标准：**
- +2: 强烈支持
- +1: 支持
- 0: 中性或不相关
- -1: 反对
- -2: 强烈反对

**权重和可靠性：**
- 权重：证据的重要性程度（0-100%）
- 可靠性：证据的可信度程度（0-100%）
        `.trim();
    };

    const generateHypothesesSection = () => {
        let content = `分析过程中考虑了以下${data.hypotheses.length}个假设：\n\n`;

        rankedHypotheses.forEach((hypothesis, index) => {
            content += `**H${index + 1}. ${hypothesis.text}**\n`;
            content += `- 综合得分：${hypothesis.score.weighted.toFixed(2)}\n`;
            content += `- 平均得分：${hypothesis.score.average.toFixed(2)}\n`;
            content += `- 评分数量：${hypothesis.score.count}\n\n`;
        });

        return content;
    };

    const generateEvidenceSection = () => {
        let content = `分析过程中考虑了以下${data.evidence.length}个证据：\n\n`;

        data.evidence.forEach((evidence, index) => {
            content += `**E${index + 1}. ${evidence.text}**\n`;
            content += `- 类型：${evidence.type}\n`;
            content += `- 权重：${evidence.weight}%\n`;
            content += `- 可靠性：${evidence.reliability}%\n`;
            if (evidence.source) {
                content += `- 来源：${evidence.source}\n`;
            }
            content += '\n';
        });

        return content;
    };

    const generateMatrixSection = () => {
        let content = `分析矩阵展示了每个证据对各假设的支持程度：\n\n`;

        // 表格标题
        content += '| 假设 | ';
        data.evidence.forEach((_, index) => {
            content += `E${index + 1} | `;
        });
        content += '综合得分 |\n';

        // 表格分隔线
        content += '|------|';
        data.evidence.forEach(() => {
            content += '-----|';
        });
        content += '-------|\n';

        // 表格内容
        rankedHypotheses.forEach((hypothesis, hIndex) => {
            content += `| H${hIndex + 1} | `;
            data.evidence.forEach((evidence) => {
                const score = getMatrixScore(hypothesis.id, evidence.id);
                const scoreLabel = score === 2 ? '++' : score === 1 ? '+' : score === 0 ? '0' : score === -1 ? '-' : '--';
                content += `${scoreLabel} | `;
            });
            content += `${hypothesis.score.weighted.toFixed(2)} |\n`;
        });

        content += '\n**矩阵统计：**\n';
        content += `- 总单元格数：${data.hypotheses.length * data.evidence.length}\n`;
        content += `- 已评分单元格：${Object.keys(data.matrix).length}\n`;
        content += `- 完成率：${Math.round((Object.keys(data.matrix).length / (data.hypotheses.length * data.evidence.length)) * 100)}%\n`;

        return content;
    };

    const generateConclusionsSection = () => {
        const topHypothesis = rankedHypotheses[0];
        if (!topHypothesis) return '暂无足够数据生成结论。';

        let content = `**主要结论：**\n`;
        content += `${topHypothesis.text}\n\n`;

        content += `**置信度评估：**\n`;
        if (rankedHypotheses.length > 1) {
            const scoreGap = topHypothesis.score.weighted - rankedHypotheses[1].score.weighted;
            const relativeGap = rankedHypotheses[1].score.weighted !== 0 ?
                (scoreGap / rankedHypotheses[1].score.weighted) * 100 : 100;

            content += `- 与第二名假设的得分差距：${scoreGap.toFixed(2)}分\n`;
            content += `- 相对差距：${relativeGap.toFixed(1)}%\n`;

            if (relativeGap > 50) {
                content += `- 置信度等级：高\n`;
            } else if (relativeGap > 20) {
                content += `- 置信度等级：中等\n`;
            } else {
                content += `- 置信度等级：低\n`;
            }
        }

        content += `\n**排名情况：**\n`;
        rankedHypotheses.forEach((hypothesis, index) => {
            content += `${index + 1}. ${hypothesis.text} (${hypothesis.score.weighted.toFixed(2)}分)\n`;
        });

        return content;
    };

    const generateSensitivitySection = () => {
        let content = `**敏感性分析结果：**\n\n`;

        if (rankedHypotheses.length >= 2) {
            const topHypothesis = rankedHypotheses[0];
            const secondHypothesis = rankedHypotheses[1];
            const scoreGap = topHypothesis.score.weighted - secondHypothesis.score.weighted;
            const relativeGap = secondHypothesis.score.weighted !== 0 ?
                (scoreGap / secondHypothesis.score.weighted) * 100 : 100;

            content += `**稳定性指标：**\n`;
            content += `- 得分差距：${scoreGap.toFixed(2)}分\n`;
            content += `- 相对差距：${relativeGap.toFixed(1)}%\n`;

            const stabilityLevel =
                relativeGap > 50 ? '高稳定性' :
                    relativeGap > 20 ? '中等稳定性' :
                        relativeGap > 10 ? '低稳定性' : '极低稳定性';

            content += `- 稳定性等级：${stabilityLevel}\n\n`;

            content += `**敏感性评估：**\n`;
            if (stabilityLevel === '高稳定性') {
                content += `结论具有高稳定性，单个评分的变化不太可能改变主要结论。\n`;
            } else if (stabilityLevel === '中等稳定性') {
                content += `结论具有中等稳定性，需要关注关键证据的评分变化。\n`;
            } else {
                content += `结论稳定性较低，对评分变化较为敏感，建议收集更多证据。\n`;
            }
        } else {
            content += `由于假设数量不足，无法进行完整的敏感性分析。\n`;
        }

        return content;
    };

    const generateRecommendations = () => {
        const topHypothesis = rankedHypotheses[0];
        const completionRate = (Object.keys(data.matrix).length / (data.hypotheses.length * data.evidence.length)) * 100;

        let content = `**基于分析结果的建议：**\n\n`;

        content += `**1. 证据收集建议：**\n`;
        if (data.evidence.length < 5) {
            content += `- 当前证据数量较少（${data.evidence.length}个），建议收集更多证据以提高分析质量\n`;
        }
        if (completionRate < 80) {
            content += `- 矩阵完成度为${completionRate.toFixed(1)}%，建议完善剩余的评分\n`;
        }
        content += `- 重点关注对主要假设影响较大的证据\n`;
        content += `- 验证现有证据的可靠性和权重设置\n\n`;

        content += `**2. 分析改进建议：**\n`;
        content += `- 定期回顾和更新分析结果\n`;
        content += `- 考虑引入新的假设或证据\n`;
        content += `- 进行团队讨论以减少个人偏见\n`;
        content += `- 结合其他分析方法进行交叉验证\n\n`;

        content += `**3. 决策建议：**\n`;
        if (topHypothesis) {
            content += `- 基于当前分析，重点关注假设：${topHypothesis.text}\n`;
            content += `- 制定针对该假设的行动计划\n`;
        }
        content += `- 建立监测机制，跟踪关键指标变化\n`;
        content += `- 准备应对其他可能情况的预案\n`;

        return content;
    };

    const generateLimitations = () => {
        return `
**分析局限性：**

**1. 方法论局限性：**
- ACH分析依赖于分析者的主观判断，可能存在认知偏差
- 评分过程中可能受到个人经验和知识背景的影响
- 假设和证据的选择可能存在不完整性

**2. 数据局限性：**
- 分析基于当前可获得的证据，可能存在重要信息缺失
- 证据的权重和可靠性评估可能需要进一步验证
- 动态环境下，证据的时效性可能影响分析结果

**3. 技术局限性：**
- 量化评分可能无法完全反映复杂的现实情况
- 假设间的相互作用可能未充分考虑
- 分析结果的解释需要结合具体情境

**4. 使用建议：**
- 将ACH分析结果作为决策参考，而非绝对依据
- 结合其他分析方法进行综合判断
- 定期更新分析以反映新的信息变化
- 保持对不确定性的敏感性
        `.trim();
    };

    const generateReport = async () => {
        setIsGenerating(true);

        // 模拟报告生成过程
        await new Promise(resolve => setTimeout(resolve, 2000));

        const content = generateReportContent();
        const timestamp = new Date();

        const report: ReportHistory = {
            id: Date.now().toString(),
            title: reportTitle,
            template: selectedTemplate,
            createdAt: timestamp,
            size: `${Math.round(content.length / 1024)}KB`,
            format: reportFormat
        };

        setReportHistory(prev => [report, ...prev]);

        // 根据格式下载报告
        downloadReport(content, reportTitle, reportFormat);

        setIsGenerating(false);
    };

    const downloadReport = (content: string, title: string, format: string) => {
        let blob: Blob;
        let filename: string;

        switch (format) {
            case 'html':
                const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; border-bottom: 2px solid #333; }
        h2 { color: #666; border-bottom: 1px solid #ccc; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .date { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <p class="date">生成时间: ${new Date().toLocaleString()}</p>
    ${content.split('\n').map(line => {
                    if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
                    if (line.startsWith('**') && line.endsWith('**')) return `<h3>${line.substring(2, line.length - 2)}</h3>`;
                    if (line.startsWith('- ')) return `<li>${line.substring(2)}</li>`;
                    if (line.startsWith('|')) return line; // 保持表格格式
                    return line ? `<p>${line}</p>` : '<br>';
                }).join('')}
</body>
</html>
                `;
                blob = new Blob([htmlContent], { type: 'text/html' });
                filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
                break;
            case 'txt':
                blob = new Blob([`${title}\n${'='.repeat(title.length)}\n生成时间: ${new Date().toLocaleString()}\n\n${content}`], { type: 'text/plain' });
                filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
                break;
            case 'md':
                blob = new Blob([`# ${title}\n\n*生成时间: ${new Date().toLocaleString()}*\n\n${content}`], { type: 'text/markdown' });
                filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
                break;
            default:
                blob = new Blob([content], { type: 'text/plain' });
                filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const previewReport = () => {
        const content = generateReportContent();
        const previewWindow = window.open('', '_blank');
        if (previewWindow) {
            previewWindow.document.write(`
                <html>
                <head>
                    <title>报告预览 - ${reportTitle}</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
                        h1 { color: #333; border-bottom: 2px solid #333; }
                        h2 { color: #666; border-bottom: 1px solid #ccc; }
                        .date { color: #666; font-size: 0.9em; }
                        pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
                    </style>
                </head>
                <body>
                    <h1>${reportTitle}</h1>
                    <p class="date">预览时间: ${new Date().toLocaleString()}</p>
                    <pre>${content}</pre>
                </body>
                </html>
            `);
            previewWindow.document.close();
        }
    };

    return (
        <div className="space-y-6">
            {/* 提示信息 */}
            <Alert className="border-blue-200 bg-blue-50">
                <FileCheck className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                    <strong>报告生成指南：</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                        <li>• 选择适合的报告模板和格式</li>
                        <li>• 自定义报告标题和内容</li>
                        <li>• 预览报告内容后再生成</li>
                        <li>• 支持多种格式导出</li>
                    </ul>
                </AlertDescription>
            </Alert>

            {/* 统计信息 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">历史报告</p>
                                <p className="text-2xl font-bold text-blue-600">{reportHistory.length}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <FileCheck className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">可用模板</p>
                                <p className="text-2xl font-bold text-green-600">{reportTemplates.length}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <Settings className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">支持格式</p>
                                <p className="text-2xl font-bold text-purple-600">3</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <FileText className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">HTML, TXT, MD</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">数据完整性</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {Math.round((Object.keys(data.matrix).length / Math.max(data.hypotheses.length * data.evidence.length, 1)) * 100)}%
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-full">
                                <BarChart3 className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 检查是否有数据 */}
            {data.hypotheses.length === 0 || data.evidence.length === 0 ? (
                <Alert className="border-orange-200 bg-orange-50">
                    <AlertDescription className="text-orange-800">
                        <strong>无法生成报告</strong>
                        <p className="mt-2">
                            需要完成前面的步骤才能生成报告：
                            <br />• 步骤1：添加假设
                            <br />• 步骤2：添加证据
                            <br />• 建议完成矩阵评分以获得完整报告
                        </p>
                    </AlertDescription>
                </Alert>
            ) : (
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="generate">生成报告</TabsTrigger>
                        <TabsTrigger value="templates">模板管理</TabsTrigger>
                        <TabsTrigger value="history">历史记录</TabsTrigger>
                    </TabsList>

                    <TabsContent value="generate" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">报告生成</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* 报告设置 */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium">报告标题</Label>
                                            <Input
                                                value={reportTitle}
                                                onChange={(e) => setReportTitle(e.target.value)}
                                                placeholder="输入报告标题"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">报告格式</Label>
                                            <Select value={reportFormat} onValueChange={setReportFormat}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="html">HTML (网页格式)</SelectItem>
                                                    <SelectItem value="txt">TXT (纯文本)</SelectItem>
                                                    <SelectItem value="md">MD (Markdown)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium">报告模板</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                                            {reportTemplates.map((template) => (
                                                <div
                                                    key={template.id}
                                                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedTemplate === template.id
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    onClick={() => setSelectedTemplate(template.id)}
                                                >
                                                    <h4 className="font-medium text-sm">{template.name}</h4>
                                                    <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            {template.sections.length} 节
                                                        </Badge>
                                                        {template.isDefault && (
                                                            <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                                                                推荐
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 操作按钮 */}
                                    <div className="flex space-x-3">
                                        <Button
                                            onClick={previewReport}
                                            variant="outline"
                                            disabled={isGenerating}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            预览报告
                                        </Button>
                                        <Button
                                            onClick={generateReport}
                                            disabled={isGenerating}
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                    生成中...
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="w-4 h-4 mr-2" />
                                                    生成报告
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="templates" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">报告模板</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {reportTemplates.map((template) => (
                                        <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h4 className="font-medium">{template.name}</h4>
                                                    <p className="text-sm text-gray-600">{template.description}</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {template.isDefault && (
                                                        <Badge variant="outline" className="text-green-600 border-green-200">
                                                            默认
                                                        </Badge>
                                                    )}
                                                    <Badge variant="outline">
                                                        {template.sections.length} 节
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h5 className="text-sm font-medium text-gray-700">包含章节：</h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {template.sections.map((section) => (
                                                        <Badge
                                                            key={section.id}
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {section.title}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">历史记录</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {reportHistory.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                        <p className="text-lg font-medium text-gray-900 mb-2">暂无历史记录</p>
                                        <p className="text-sm text-gray-600">生成第一个报告后，历史记录将显示在这里</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {reportHistory.map((report) => (
                                            <div key={report.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">{report.title}</h4>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                                        <span>模板: {reportTemplates.find(t => t.id === report.template)?.name}</span>
                                                        <span>大小: {report.size}</span>
                                                        <span>格式: {report.format.toUpperCase()}</span>
                                                        <span>时间: {report.createdAt.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Button size="sm" variant="outline">
                                                        <Download className="w-4 h-4 mr-1" />
                                                        下载
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        <Share2 className="w-4 h-4 mr-1" />
                                                        分享
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}

            {/* 进度指示器 */}
            <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm">
                                报告生成功能已就绪 - 数据完整性: {Math.round((Object.keys(data.matrix).length / Math.max(data.hypotheses.length * data.evidence.length, 1)) * 100)}%
                            </span>
                        </div>
                        <div className="text-sm text-green-700">
                            可以进入最后一步设置里程碑
                        </div>
                    </div>
                </AlertDescription>
            </Alert>
        </div>
    );
}; 
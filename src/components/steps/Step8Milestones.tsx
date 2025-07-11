import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, TrendingUp, BarChart3, Target, Eye, FileText, Award, BookOpen, Lightbulb, Download, RefreshCw, ArrowRight, Star, Shield, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAnalysisStore } from '../../store/analysisStore';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';

interface QualityMetrics {
    completeness: number;
    consistency: number;
    reliability: number;
    coverage: number;
    overall: number;
}

interface AnalysisInsight {
    id: string;
    type: 'strength' | 'weakness' | 'opportunity' | 'risk';
    category: 'data' | 'method' | 'conclusion' | 'process';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    recommendation: string;
}

interface CompletionCheck {
    step: string;
    name: string;
    completed: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
}

export const Step8Milestones: React.FC = () => {
    const { data } = useAnalysisStore();
    const [selectedTab, setSelectedTab] = useState('overview');

    // 计算分析完整性检查
    const calculateCompletionChecks = (): CompletionCheck[] => {
        const checks: CompletionCheck[] = [];

        // 步骤1: 假设管理
        const hypothesesCheck: CompletionCheck = {
            step: 'hypotheses',
            name: '假设管理',
            completed: data.hypotheses.length >= 3,
            score: 0,
            issues: [],
            recommendations: []
        };

        if (data.hypotheses.length === 0) {
            hypothesesCheck.score = 0;
            hypothesesCheck.issues.push('未添加任何假设');
            hypothesesCheck.recommendations.push('至少添加3-5个相互排斥的假设');
        } else if (data.hypotheses.length < 3) {
            hypothesesCheck.score = 50;
            hypothesesCheck.issues.push('假设数量较少');
            hypothesesCheck.recommendations.push('建议增加更多假设以提高分析全面性');
        } else {
            hypothesesCheck.score = 100;
            if (data.hypotheses.length > 7) {
                hypothesesCheck.issues.push('假设数量较多，可能影响分析效率');
                hypothesesCheck.recommendations.push('考虑合并相似假设');
            }
        }
        checks.push(hypothesesCheck);

        // 步骤2: 证据收集
        const evidenceCheck: CompletionCheck = {
            step: 'evidence',
            name: '证据收集',
            completed: data.evidence.length >= 5,
            score: 0,
            issues: [],
            recommendations: []
        };

        if (data.evidence.length === 0) {
            evidenceCheck.score = 0;
            evidenceCheck.issues.push('未收集任何证据');
            evidenceCheck.recommendations.push('收集支持和反对各假设的证据');
        } else if (data.evidence.length < 5) {
            evidenceCheck.score = 60;
            evidenceCheck.issues.push('证据数量较少');
            evidenceCheck.recommendations.push('建议收集更多证据以提高分析可靠性');
        } else {
            evidenceCheck.score = 100;

            // 检查证据类型平衡性
            const supportingCount = data.evidence.filter(e => e.type === 'supporting').length;
            const opposingCount = data.evidence.filter(e => e.type === 'opposing').length;
            const neutralCount = data.evidence.filter(e => e.type === 'neutral').length;

            if (supportingCount === 0) {
                evidenceCheck.issues.push('缺乏支持性证据');
                evidenceCheck.recommendations.push('添加支持性证据');
            }
            if (opposingCount === 0) {
                evidenceCheck.issues.push('缺乏反对性证据');
                evidenceCheck.recommendations.push('添加反对性证据');
            }

            // 检查证据质量
            const avgReliability = data.evidence.reduce((sum, e) => sum + e.reliability, 0) / data.evidence.length;
            if (avgReliability < 60) {
                evidenceCheck.issues.push('证据平均可靠性较低');
                evidenceCheck.recommendations.push('提高证据来源的可靠性');
            }
        }
        checks.push(evidenceCheck);

        // 步骤3: 分析矩阵
        const matrixCheck: CompletionCheck = {
            step: 'matrix',
            name: '分析矩阵',
            completed: false,
            score: 0,
            issues: [],
            recommendations: []
        };

        const totalCells = data.hypotheses.length * data.evidence.length;
        const filledCells = Object.keys(data.matrix).length;
        const completionRate = totalCells > 0 ? (filledCells / totalCells) * 100 : 0;

        matrixCheck.score = completionRate;
        matrixCheck.completed = completionRate >= 70;

        if (completionRate === 0) {
            matrixCheck.issues.push('矩阵未开始评分');
            matrixCheck.recommendations.push('对证据与假设的关系进行评分');
        } else if (completionRate < 50) {
            matrixCheck.issues.push('矩阵完成度较低');
            matrixCheck.recommendations.push('完成更多矩阵单元格的评分');
        } else if (completionRate < 70) {
            matrixCheck.issues.push('矩阵部分缺失');
            matrixCheck.recommendations.push('完成剩余矩阵评分');
        }
        checks.push(matrixCheck);

        // 步骤4: 矩阵精简
        const refineCheck: CompletionCheck = {
            step: 'refine',
            name: '矩阵精简',
            completed: matrixCheck.completed,
            score: matrixCheck.completed ? 100 : 0,
            issues: [],
            recommendations: []
        };

        if (!matrixCheck.completed) {
            refineCheck.issues.push('矩阵未完成，无法进行精简');
            refineCheck.recommendations.push('先完成矩阵评分');
        }
        checks.push(refineCheck);

        // 步骤5: 分析结论
        const conclusionCheck: CompletionCheck = {
            step: 'conclusion',
            name: '分析结论',
            completed: data.conclusions.length > 0,
            score: data.conclusions.length > 0 ? 100 : 0,
            issues: [],
            recommendations: []
        };

        if (data.conclusions.length === 0) {
            conclusionCheck.issues.push('未得出分析结论');
            conclusionCheck.recommendations.push('基于矩阵分析得出初步结论');
        }
        checks.push(conclusionCheck);

        // 步骤6: 敏感性分析
        const sensitivityCheck: CompletionCheck = {
            step: 'sensitivity',
            name: '敏感性分析',
            completed: data.sensitivity && data.sensitivity.length > 0,
            score: (data.sensitivity && data.sensitivity.length > 0) ? 100 : 0,
            issues: [],
            recommendations: []
        };

        if (!data.sensitivity || data.sensitivity.length === 0) {
            sensitivityCheck.issues.push('未进行敏感性分析');
            sensitivityCheck.recommendations.push('分析结论对关键证据变化的敏感性');
        }
        checks.push(sensitivityCheck);

        // 步骤7: 报告生成
        const reportCheck: CompletionCheck = {
            step: 'report',
            name: '报告生成',
            completed: data.report && (
                Boolean(data.report.sections.summary.content) ||
                Boolean(data.report.sections.analysis.content) ||
                Boolean(data.report.sections.conclusions.content)
            ),
            score: 0,
            issues: [],
            recommendations: []
        };

        if (!data.report || (
            !data.report.sections.summary.content &&
            !data.report.sections.analysis.content &&
            !data.report.sections.conclusions.content
        )) {
            reportCheck.score = 0;
            reportCheck.issues.push('未生成分析报告');
            reportCheck.recommendations.push('生成完整的分析报告');
        } else {
            let reportScore = 0;
            if (data.report.sections.summary.content) reportScore += 33;
            if (data.report.sections.analysis.content) reportScore += 33;
            if (data.report.sections.conclusions.content) reportScore += 34;
            reportCheck.score = reportScore;
            reportCheck.completed = reportScore >= 67;
        }
        checks.push(reportCheck);

        return checks;
    };

    // 计算质量指标
    const calculateQualityMetrics = (): QualityMetrics => {
        const checks = calculateCompletionChecks();

        // 完整性：基于各步骤完成情况
        const completeness = checks.reduce((sum, check) => sum + check.score, 0) / checks.length;

        // 一致性：评分的一致性
        const matrixScores = Object.values(data.matrix);
        const consistency = matrixScores.length > 0 ?
            100 - (matrixScores.reduce((sum, score, i, arr) => {
                const variance = arr.reduce((vSum, v) => vSum + Math.pow(v - score, 2), 0) / arr.length;
                return sum + variance;
            }, 0) / matrixScores.length) * 25 : 0;

        // 可靠性：证据可靠性平均值
        const reliability = data.evidence.length > 0 ?
            data.evidence.reduce((sum, e) => sum + e.reliability, 0) / data.evidence.length : 0;

        // 覆盖度：矩阵填充率
        const totalCells = data.hypotheses.length * data.evidence.length;
        const filledCells = Object.keys(data.matrix).length;
        const coverage = totalCells > 0 ? (filledCells / totalCells) * 100 : 0;

        // 综合评分
        const overall = (completeness + consistency + reliability + coverage) / 4;

        return {
            completeness: Math.round(completeness),
            consistency: Math.round(consistency),
            reliability: Math.round(reliability),
            coverage: Math.round(coverage),
            overall: Math.round(overall)
        };
    };

    // 生成分析洞察
    const generateAnalysisInsights = (): AnalysisInsight[] => {
        const insights: AnalysisInsight[] = [];
        const checks = calculateCompletionChecks();
        const metrics = calculateQualityMetrics();

        // 数据质量洞察
        if (metrics.reliability < 60) {
            insights.push({
                id: 'low-reliability',
                type: 'weakness',
                category: 'data',
                title: '证据可靠性偏低',
                description: `当前证据平均可靠性为 ${metrics.reliability}%，低于建议标准`,
                impact: 'high',
                recommendation: '重新评估证据来源，提高关键证据的可靠性评分'
            });
        }

        // 方法论洞察
        if (metrics.coverage < 70) {
            insights.push({
                id: 'incomplete-matrix',
                type: 'risk',
                category: 'method',
                title: '矩阵评分不完整',
                description: `矩阵覆盖率为 ${metrics.coverage}%，可能影响分析结果的准确性`,
                impact: 'high',
                recommendation: '完成所有矩阵单元格的评分以确保分析全面性'
            });
        }

        // 过程洞察
        if (data.hypotheses.length >= 3 && data.evidence.length >= 5) {
            insights.push({
                id: 'good-foundation',
                type: 'strength',
                category: 'process',
                title: '分析基础扎实',
                description: `具备 ${data.hypotheses.length} 个假设和 ${data.evidence.length} 个证据，分析基础良好`,
                impact: 'medium',
                recommendation: '继续保持高质量的假设和证据收集'
            });
        }

        // 结论洞察
        if (data.conclusions.length > 0) {
            insights.push({
                id: 'conclusions-available',
                type: 'opportunity',
                category: 'conclusion',
                title: '分析结论已形成',
                description: '已生成分析结论，可进行后续的决策支持',
                impact: 'medium',
                recommendation: '基于结论制定具体的行动计划'
            });
        }

        return insights;
    };

    const completionChecks = useMemo(() => calculateCompletionChecks(), [data]);
    const qualityMetrics = useMemo(() => calculateQualityMetrics(), [data]);
    const analysisInsights = useMemo(() => generateAnalysisInsights(), [data]);

    // 获取完成状态颜色
    const getCompletionColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    // 获取质量等级
    const getQualityLevel = (score: number) => {
        if (score >= 90) return { label: '优秀', color: 'text-green-600', bgColor: 'bg-green-100' };
        if (score >= 80) return { label: '良好', color: 'text-blue-600', bgColor: 'bg-blue-100' };
        if (score >= 70) return { label: '中等', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
        if (score >= 60) return { label: '待改进', color: 'text-orange-600', bgColor: 'bg-orange-100' };
        return { label: '需改进', color: 'text-red-600', bgColor: 'bg-red-100' };
    };

    // 获取洞察类型配置
    const getInsightTypeConfig = (type: string) => {
        switch (type) {
            case 'strength':
                return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', label: '优势' };
            case 'weakness':
                return { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-100', label: '劣势' };
            case 'opportunity':
                return { icon: TrendingUp, color: 'text-blue-600', bgColor: 'bg-blue-100', label: '机会' };
            case 'risk':
                return { icon: Shield, color: 'text-orange-600', bgColor: 'bg-orange-100', label: '风险' };
            default:
                return { icon: Eye, color: 'text-gray-600', bgColor: 'bg-gray-100', label: '洞察' };
        }
    };

    // 导出分析总结
    const exportAnalysisSummary = () => {
        const summary = {
            title: data.title,
            topic: data.topic,
            completionChecks,
            qualityMetrics,
            analysisInsights,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ACH_分析总结_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        toast.success('分析总结已导出');
    };

    return (
        <div className="space-y-6">
            {/* 提示信息 */}
            <Alert className="border-blue-200 bg-blue-50">
                <Award className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                    <strong>分析总结与验证：</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                        <li>• 检查分析过程的完整性和质量</li>
                        <li>• 评估结论的可信度和稳定性</li>
                        <li>• 识别分析中的优势和改进空间</li>
                        <li>• 提供质量提升建议</li>
                    </ul>
                </AlertDescription>
            </Alert>

            {/* 质量指标卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">完整性</p>
                                <p className={`text-2xl font-bold ${getCompletionColor(qualityMetrics.completeness)}`}>
                                    {qualityMetrics.completeness}%
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <CheckCircle className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">一致性</p>
                                <p className={`text-2xl font-bold ${getCompletionColor(qualityMetrics.consistency)}`}>
                                    {qualityMetrics.consistency}%
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <BarChart3 className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">可靠性</p>
                                <p className={`text-2xl font-bold ${getCompletionColor(qualityMetrics.reliability)}`}>
                                    {qualityMetrics.reliability}%
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <Shield className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">覆盖度</p>
                                <p className={`text-2xl font-bold ${getCompletionColor(qualityMetrics.coverage)}`}>
                                    {qualityMetrics.coverage}%
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-full">
                                <Target className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">综合评分</p>
                                <p className={`text-2xl font-bold ${getCompletionColor(qualityMetrics.overall)}`}>
                                    {qualityMetrics.overall}%
                                </p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <Star className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 主要内容标签页 */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">完整性检查</TabsTrigger>
                    <TabsTrigger value="insights">分析洞察</TabsTrigger>
                    <TabsTrigger value="summary">总结报告</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">分析步骤完整性检查</CardTitle>
                                <div className="flex items-center space-x-2">
                                    <Badge className={getQualityLevel(qualityMetrics.overall).bgColor + ' ' + getQualityLevel(qualityMetrics.overall).color}>
                                        {getQualityLevel(qualityMetrics.overall).label}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {completionChecks.map((check, index) => (
                                    <div key={check.step} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${check.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                    {check.completed ? (
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                    ) : (
                                                        <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{check.name}</h3>
                                                    <p className="text-sm text-gray-600">步骤 {index + 1}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`text-sm font-medium ${getCompletionColor(check.score)}`}>
                                                    {check.score}%
                                                </span>
                                                <div className="w-24">
                                                    <Progress value={check.score} className="h-2" />
                                                </div>
                                            </div>
                                        </div>

                                        {check.issues.length > 0 && (
                                            <div className="mb-3">
                                                <p className="text-sm font-medium text-red-700 mb-1">发现问题：</p>
                                                <ul className="text-sm text-red-600 space-y-1">
                                                    {check.issues.map((issue, i) => (
                                                        <li key={i} className="flex items-start space-x-2">
                                                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                            <span>{issue}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {check.recommendations.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-blue-700 mb-1">改进建议：</p>
                                                <ul className="text-sm text-blue-600 space-y-1">
                                                    {check.recommendations.map((rec, i) => (
                                                        <li key={i} className="flex items-start space-x-2">
                                                            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                            <span>{rec}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="insights" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">分析洞察与建议</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {analysisInsights.length === 0 ? (
                                <div className="text-center py-8">
                                    <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                    <p className="text-lg font-medium text-gray-900 mb-2">暂无特别洞察</p>
                                    <p className="text-sm text-gray-600">当前分析过程中没有发现需要特别关注的问题</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {analysisInsights.map((insight) => {
                                        const typeConfig = getInsightTypeConfig(insight.type);
                                        const TypeIcon = typeConfig.icon;

                                        return (
                                            <div key={insight.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start space-x-3">
                                                    <div className={`p-2 rounded-full ${typeConfig.bgColor}`}>
                                                        <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <Badge className={`${typeConfig.bgColor} ${typeConfig.color}`}>
                                                                {typeConfig.label}
                                                            </Badge>
                                                            <Badge variant="outline" className="text-xs">
                                                                {insight.category}
                                                            </Badge>
                                                            <Badge variant="outline" className={`text-xs ${insight.impact === 'high' ? 'border-red-300 text-red-600' :
                                                                insight.impact === 'medium' ? 'border-yellow-300 text-yellow-600' :
                                                                    'border-green-300 text-green-600'
                                                                }`}>
                                                                {insight.impact}影响
                                                            </Badge>
                                                        </div>
                                                        <h3 className="font-medium text-gray-900 mb-1">{insight.title}</h3>
                                                        <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                                                        <div className="bg-gray-50 p-3 rounded-md">
                                                            <p className="text-sm font-medium text-gray-700 mb-1">建议措施：</p>
                                                            <p className="text-sm text-gray-600">{insight.recommendation}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="summary" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">分析总结报告</CardTitle>
                                <Button onClick={exportAnalysisSummary} size="sm">
                                    <Download className="w-4 h-4 mr-2" />
                                    导出总结
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* 基本信息 */}
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">分析基本信息</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-md">
                                            <p className="text-sm font-medium text-gray-700">项目标题</p>
                                            <p className="text-sm text-gray-900">{data.title || '未设置'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-md">
                                            <p className="text-sm font-medium text-gray-700">分析议题</p>
                                            <p className="text-sm text-gray-900">{data.topic || '未设置'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-md">
                                            <p className="text-sm font-medium text-gray-700">假设数量</p>
                                            <p className="text-sm text-gray-900">{data.hypotheses.length} 个</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-md">
                                            <p className="text-sm font-medium text-gray-700">证据数量</p>
                                            <p className="text-sm text-gray-900">{data.evidence.length} 个</p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* 质量评估 */}
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">质量评估</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">完整性</span>
                                                <span className="font-medium">{qualityMetrics.completeness}%</span>
                                            </div>
                                            <Progress value={qualityMetrics.completeness} className="h-2" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">一致性</span>
                                                <span className="font-medium">{qualityMetrics.consistency}%</span>
                                            </div>
                                            <Progress value={qualityMetrics.consistency} className="h-2" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">可靠性</span>
                                                <span className="font-medium">{qualityMetrics.reliability}%</span>
                                            </div>
                                            <Progress value={qualityMetrics.reliability} className="h-2" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">覆盖度</span>
                                                <span className="font-medium">{qualityMetrics.coverage}%</span>
                                            </div>
                                            <Progress value={qualityMetrics.coverage} className="h-2" />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* 关键发现 */}
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">关键发现</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-green-50 p-3 rounded-md">
                                            <p className="text-sm font-medium text-green-700 mb-1">分析优势</p>
                                            <p className="text-sm text-green-600">
                                                {analysisInsights.filter(i => i.type === 'strength').length} 个优势项
                                            </p>
                                        </div>
                                        <div className="bg-red-50 p-3 rounded-md">
                                            <p className="text-sm font-medium text-red-700 mb-1">需要改进</p>
                                            <p className="text-sm text-red-600">
                                                {analysisInsights.filter(i => i.type === 'weakness').length} 个改进项
                                            </p>
                                        </div>
                                        <div className="bg-blue-50 p-3 rounded-md">
                                            <p className="text-sm font-medium text-blue-700 mb-1">发展机会</p>
                                            <p className="text-sm text-blue-600">
                                                {analysisInsights.filter(i => i.type === 'opportunity').length} 个机会
                                            </p>
                                        </div>
                                        <div className="bg-orange-50 p-3 rounded-md">
                                            <p className="text-sm font-medium text-orange-700 mb-1">潜在风险</p>
                                            <p className="text-sm text-orange-600">
                                                {analysisInsights.filter(i => i.type === 'risk').length} 个风险
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* 总体评价 */}
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">总体评价</h3>
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getQualityLevel(qualityMetrics.overall).bgColor}`}>
                                                <span className={`text-xl font-bold ${getQualityLevel(qualityMetrics.overall).color}`}>
                                                    {Math.round(qualityMetrics.overall / 10)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">分析质量：{getQualityLevel(qualityMetrics.overall).label}</p>
                                                <p className="text-sm text-gray-600">综合得分：{qualityMetrics.overall}/100</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {qualityMetrics.overall >= 90 ? '本次分析质量优秀，各项指标均达到高标准，可以作为决策依据。' :
                                                qualityMetrics.overall >= 80 ? '本次分析质量良好，大部分指标达到标准，可以支持决策制定。' :
                                                    qualityMetrics.overall >= 70 ? '本次分析质量中等，建议在关键环节进行改进后再做决策。' :
                                                        qualityMetrics.overall >= 60 ? '本次分析质量有待改进，建议重新检查和完善后再使用。' :
                                                            '本次分析质量需要大幅改进，建议重新进行分析过程。'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* 进度指示器 */}
            <Alert className={`${qualityMetrics.overall >= 80 ? 'border-green-200 bg-green-50' :
                qualityMetrics.overall >= 60 ? 'border-yellow-200 bg-yellow-50' :
                    'border-red-200 bg-red-50'
                }`}>
                <AlertDescription className={`${qualityMetrics.overall >= 80 ? 'text-green-800' :
                    qualityMetrics.overall >= 60 ? 'text-yellow-800' :
                        'text-red-800'
                    }`}>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${qualityMetrics.overall >= 80 ? 'bg-green-500' :
                                qualityMetrics.overall >= 60 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                }`}></div>
                            <span className="text-sm">
                                分析质量评估完成 - 综合得分: {qualityMetrics.overall}%
                            </span>
                        </div>
                        <div className="text-sm">
                            {qualityMetrics.overall >= 80 ? '分析质量优秀，可以完成分析流程' :
                                qualityMetrics.overall >= 60 ? '分析质量良好，建议优化后完成流程' :
                                    '分析质量需要改进，建议先完善相关步骤'}
                        </div>
                    </div>
                </AlertDescription>
            </Alert>
        </div>
    );
}; 
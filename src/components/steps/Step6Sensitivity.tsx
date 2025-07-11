import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, BarChart3, AlertCircle, Target, RefreshCw, Download, Settings, Play, Pause, RotateCcw } from 'lucide-react';
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

interface SensitivityResult {
    hypothesisId: string;
    originalScore: number;
    newScore: number;
    change: number;
    changePercent: number;
    ranking: number;
    originalRanking: number;
    rankingChange: number;
}

interface SensitivityScenario {
    id: string;
    name: string;
    description: string;
    changes: Array<{
        hypothesisId: string;
        evidenceId: string;
        originalScore: number;
        newScore: number;
    }>;
    results: SensitivityResult[];
}

export const Step6Sensitivity: React.FC = () => {
    const { data, updateMatrixScore, updateSensitivityAnalysis } = useAnalysisStore();
    const [selectedTab, setSelectedTab] = useState('auto');
    const [testMode, setTestMode] = useState(false);
    const [selectedHypothesis, setSelectedHypothesis] = useState<string>('');
    const [selectedEvidence, setSelectedEvidence] = useState<string>('');
    const [testScore, setTestScore] = useState<number>(0);
    const [scenarios, setScenarios] = useState<SensitivityScenario[]>([]);
    const [runningScenario, setRunningScenario] = useState<string>('');
    const [weightAdjustments, setWeightAdjustments] = useState<Record<string, number>>({});
    const [reliabilityAdjustments, setReliabilityAdjustments] = useState<Record<string, number>>({});
    const [autoTestResults, setAutoTestResults] = useState<any[]>([]);
    const [isAutoTestComplete, setIsAutoTestComplete] = useState(false);
    const [singleTestResults, setSingleTestResults] = useState<SensitivityResult[] | null>(null);
    const [sensitivityFilter, setSensitivityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'single' | 'weight' | 'reliability'>('all');

    // 当组件首次加载时，标记为已访问敏感性分析步骤
    React.useEffect(() => {
        if (data.hypotheses.length > 0 && data.evidence.length > 0 && Object.keys(data.matrix).length > 0) {
            // 只有在有基础数据的情况下才标记为已访问
            const sensitivityData = {
                stepVisited: true,
                visitedAt: new Date()
            };
            updateSensitivityAnalysis(sensitivityData);
        }
    }, []);

    const getMatrixScore = (hypothesisId: string, evidenceId: string): number => {
        const key = `${hypothesisId}-${evidenceId}`;
        return data.matrix[key] || 0;
    };

    const calculateHypothesisScore = (hypothesis: any, matrixOverride?: Record<string, number>, weightOverride?: Record<string, number>, reliabilityOverride?: Record<string, number>) => {
        const scores = data.evidence.map(evidence => {
            const score = matrixOverride ?
                (matrixOverride[`${hypothesis.id}-${evidence.id}`] ?? getMatrixScore(hypothesis.id, evidence.id)) :
                getMatrixScore(hypothesis.id, evidence.id);

            const weight = weightOverride?.[evidence.id] ?? evidence.weight;
            const reliability = reliabilityOverride?.[evidence.id] ?? evidence.reliability;

            const weightedScore = score * (weight / 100) * (reliability / 100);
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

    const getRankedHypotheses = (matrixOverride?: Record<string, number>, weightOverride?: Record<string, number>, reliabilityOverride?: Record<string, number>) => {
        return data.hypotheses
            .map(hypothesis => ({
                ...hypothesis,
                score: calculateHypothesisScore(hypothesis, matrixOverride, weightOverride, reliabilityOverride)
            }))
            .sort((a, b) => b.score.weighted - a.score.weighted);
    };

    const originalRanking = useMemo(() => getRankedHypotheses(), [data.hypotheses, data.evidence, data.matrix]);

    // 单变量敏感性分析
    const performSingleVariableSensitivity = (hypothesisId: string, evidenceId: string, newScore: number) => {
        const matrixOverride = { [`${hypothesisId}-${evidenceId}`]: newScore };
        const newRanking = getRankedHypotheses(matrixOverride);

        const results: SensitivityResult[] = data.hypotheses.map(hypothesis => {
            const originalHyp = originalRanking.find(h => h.id === hypothesis.id);
            const newHyp = newRanking.find(h => h.id === hypothesis.id);

            const originalScore = originalHyp?.score.weighted || 0;
            const newScore = newHyp?.score.weighted || 0;
            const change = newScore - originalScore;
            const changePercent = originalScore !== 0 ? (change / originalScore) * 100 : 0;

            const originalRank = originalRanking.findIndex(h => h.id === hypothesis.id) + 1;
            const newRank = newRanking.findIndex(h => h.id === hypothesis.id) + 1;

            return {
                hypothesisId: hypothesis.id,
                originalScore,
                newScore,
                change,
                changePercent,
                ranking: newRank,
                originalRanking: originalRank,
                rankingChange: newRank - originalRank
            };
        });

        return results;
    };

    // 权重敏感性分析
    const performWeightSensitivity = (evidenceId: string, newWeight: number) => {
        const weightOverride = { [evidenceId]: newWeight };
        const newRanking = getRankedHypotheses(undefined, weightOverride);

        const results: SensitivityResult[] = data.hypotheses.map(hypothesis => {
            const originalHyp = originalRanking.find(h => h.id === hypothesis.id);
            const newHyp = newRanking.find(h => h.id === hypothesis.id);

            const originalScore = originalHyp?.score.weighted || 0;
            const newScore = newHyp?.score.weighted || 0;
            const change = newScore - originalScore;
            const changePercent = originalScore !== 0 ? (change / originalScore) * 100 : 0;

            const originalRank = originalRanking.findIndex(h => h.id === hypothesis.id) + 1;
            const newRank = newRanking.findIndex(h => h.id === hypothesis.id) + 1;

            return {
                hypothesisId: hypothesis.id,
                originalScore,
                newScore,
                change,
                changePercent,
                ranking: newRank,
                originalRanking: originalRank,
                rankingChange: newRank - originalRank
            };
        });

        return results;
    };

    // 可靠性敏感性分析
    const performReliabilitySensitivity = (evidenceId: string, newReliability: number) => {
        const reliabilityOverride = { [evidenceId]: newReliability };
        const newRanking = getRankedHypotheses(undefined, undefined, reliabilityOverride);

        const results: SensitivityResult[] = data.hypotheses.map(hypothesis => {
            const originalHyp = originalRanking.find(h => h.id === hypothesis.id);
            const newHyp = newRanking.find(h => h.id === hypothesis.id);

            const originalScore = originalHyp?.score.weighted || 0;
            const newScore = newHyp?.score.weighted || 0;
            const change = newScore - originalScore;
            const changePercent = originalScore !== 0 ? (change / originalScore) * 100 : 0;

            const originalRank = originalRanking.findIndex(h => h.id === hypothesis.id) + 1;
            const newRank = newRanking.findIndex(h => h.id === hypothesis.id) + 1;

            return {
                hypothesisId: hypothesis.id,
                originalScore,
                newScore,
                change,
                changePercent,
                ranking: newRank,
                originalRanking: originalRank,
                rankingChange: newRank - originalRank
            };
        });

        return results;
    };

    // 计算稳定性指标
    const calculateStabilityMetrics = () => {
        if (originalRanking.length < 2) return null;

        const topHypothesis = originalRanking[0];
        const secondHypothesis = originalRanking[1];

        const scoreGap = topHypothesis.score.weighted - secondHypothesis.score.weighted;
        const relativeGap = secondHypothesis.score.weighted !== 0 ?
            (scoreGap / secondHypothesis.score.weighted) * 100 :
            100;

        // 计算需要多少评分变化才能改变排名
        const minScoreChange = scoreGap / 2;

        // 评估稳定性等级
        const stabilityLevel =
            relativeGap > 50 ? 'high' :
                relativeGap > 20 ? 'medium' :
                    relativeGap > 10 ? 'low' : 'very-low';

        return {
            scoreGap,
            relativeGap,
            minScoreChange,
            stabilityLevel,
            topHypothesis: topHypothesis.text,
            secondHypothesis: secondHypothesis.text
        };
    };

    const stabilityMetrics = calculateStabilityMetrics();

    // 自动敏感性测试
    const performAutoSensitivityTest = () => {
        const testResults: any[] = [];

        // 1. 测试所有单个评分变化
        data.hypotheses.forEach(hypothesis => {
            data.evidence.forEach(evidence => {
                const currentScore = getMatrixScore(hypothesis.id, evidence.id);

                // 测试评分上升和下降的影响
                [-2, -1, 0, 1, 2].forEach(newScore => {
                    if (newScore !== currentScore) {
                        const results = performSingleVariableSensitivity(hypothesis.id, evidence.id, newScore);
                        const maxChange = Math.max(...results.map(r => Math.abs(r.changePercent)));
                        const rankingChanges = results.filter(r => r.rankingChange !== 0).length;

                        testResults.push({
                            type: 'single',
                            hypothesisId: hypothesis.id,
                            evidenceId: evidence.id,
                            originalScore: currentScore,
                            newScore: newScore,
                            maxChange: maxChange,
                            rankingChanges: rankingChanges,
                            sensitivity: maxChange > 20 ? 'high' : maxChange > 10 ? 'medium' : 'low',
                            results: results
                        });
                    }
                });
            });
        });

        // 2. 测试权重敏感性
        data.evidence.forEach(evidence => {
            [25, 50, 75, 100].forEach(newWeight => {
                if (newWeight !== evidence.weight) {
                    const results = performWeightSensitivity(evidence.id, newWeight);
                    const maxChange = Math.max(...results.map(r => Math.abs(r.changePercent)));
                    const rankingChanges = results.filter(r => r.rankingChange !== 0).length;

                    testResults.push({
                        type: 'weight',
                        evidenceId: evidence.id,
                        originalWeight: evidence.weight,
                        newWeight: newWeight,
                        maxChange: maxChange,
                        rankingChanges: rankingChanges,
                        sensitivity: maxChange > 20 ? 'high' : maxChange > 10 ? 'medium' : 'low',
                        results: results
                    });
                }
            });
        });

        // 3. 测试可靠性敏感性
        data.evidence.forEach(evidence => {
            [25, 50, 75, 100].forEach(newReliability => {
                if (newReliability !== evidence.reliability) {
                    const results = performReliabilitySensitivity(evidence.id, newReliability);
                    const maxChange = Math.max(...results.map(r => Math.abs(r.changePercent)));
                    const rankingChanges = results.filter(r => r.rankingChange !== 0).length;

                    testResults.push({
                        type: 'reliability',
                        evidenceId: evidence.id,
                        originalReliability: evidence.reliability,
                        newReliability: newReliability,
                        maxChange: maxChange,
                        rankingChanges: rankingChanges,
                        sensitivity: maxChange > 20 ? 'high' : maxChange > 10 ? 'medium' : 'low',
                        results: results
                    });
                }
            });
        });

        // 按敏感性排序
        testResults.sort((a, b) => b.maxChange - a.maxChange);

        setAutoTestResults(testResults);
        setIsAutoTestComplete(true);

        // 保存敏感性分析结果到store
        const sensitivityData = {
            testResults,
            stabilityMetrics,
            completedAt: new Date(),
            testCount: testResults.length
        };
        updateSensitivityAnalysis(sensitivityData);

        return testResults;
    };

    // 自动运行测试
    React.useEffect(() => {
        if (data.hypotheses.length > 0 && data.evidence.length > 0 && Object.keys(data.matrix).length > 0) {
            const timer = setTimeout(() => {
                performAutoSensitivityTest();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [data.hypotheses, data.evidence, data.matrix]);

    // 生成预设场景
    const generateScenarios = () => {
        const scenarios: SensitivityScenario[] = [];

        // 最佳情况场景
        scenarios.push({
            id: 'best-case',
            name: '最佳情况',
            description: '所有支持证据评分提升到最高',
            changes: [],
            results: []
        });

        // 最差情况场景
        scenarios.push({
            id: 'worst-case',
            name: '最差情况',
            description: '所有支持证据评分降低到最低',
            changes: [],
            results: []
        });

        // 关键证据失效场景
        scenarios.push({
            id: 'key-evidence-fail',
            name: '关键证据失效',
            description: '高权重证据评分变为负值',
            changes: [],
            results: []
        });

        return scenarios;
    };

    const runSensitivityTest = () => {
        if (!selectedHypothesis || !selectedEvidence) return;

        const results = performSingleVariableSensitivity(selectedHypothesis, selectedEvidence, testScore);
        setSingleTestResults(results);

        // 保存单变量敏感性分析结果
        const sensitivityData = {
            singleVariableTest: {
                hypothesisId: selectedHypothesis,
                evidenceId: selectedEvidence,
                testScore,
                results,
                completedAt: new Date()
            }
        };
        updateSensitivityAnalysis(sensitivityData);
    };

    const exportSensitivityReport = () => {
        const content = `
敏感性分析报告
==============

分析主题: ${data.title}
分析时间: ${new Date().toLocaleDateString()}

稳定性指标
----------
${stabilityMetrics ? `
主要假设: ${stabilityMetrics.topHypothesis}
次要假设: ${stabilityMetrics.secondHypothesis}
得分差距: ${stabilityMetrics.scoreGap.toFixed(2)}
相对差距: ${stabilityMetrics.relativeGap.toFixed(1)}%
最小变化阈值: ${stabilityMetrics.minScoreChange.toFixed(2)}
稳定性等级: ${stabilityMetrics.stabilityLevel}
` : '数据不足'}

假设排序
--------
${originalRanking.map((h, i) => `${i + 1}. ${h.text} (得分: ${h.score.weighted.toFixed(2)})`).join('\n')}

敏感性测试建议
--------------
1. 对得分差距较小的假设进行重点测试
2. 关注高权重证据的评分变化影响
3. 测试关键证据失效的情况
4. 验证结论在不同场景下的稳定性

注意事项
--------
- 敏感性分析有助于评估结论的稳定性
- 如果结论对单个评分变化敏感，需要进一步验证
- 建议结合多种分析方法得出最终结论
        `.trim();

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ACH_敏感性分析_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getStabilityColor = (level: string) => {
        switch (level) {
            case 'high': return 'text-green-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-orange-600';
            case 'very-low': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getStabilityLabel = (level: string) => {
        switch (level) {
            case 'high': return '高稳定性';
            case 'medium': return '中等稳定性';
            case 'low': return '低稳定性';
            case 'very-low': return '极低稳定性';
            default: return '未知';
        }
    };

    return (
        <div className="space-y-6">
            {/* 提示信息 */}
            <Alert className="border-blue-200 bg-blue-50">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                    <strong>敏感性分析指南：</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                        <li>• 测试单个评分变化对结论的影响</li>
                        <li>• 分析证据权重和可靠性的敏感性</li>
                        <li>• 评估结论在不同场景下的稳定性</li>
                        <li>• 识别关键的敏感性因素</li>
                    </ul>
                </AlertDescription>
            </Alert>

            {/* 统计信息 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">稳定性等级</p>
                                <p className={`text-lg font-bold ${stabilityMetrics ? getStabilityColor(stabilityMetrics.stabilityLevel) : 'text-gray-400'}`}>
                                    {stabilityMetrics ? getStabilityLabel(stabilityMetrics.stabilityLevel) : 'N/A'}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Target className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">得分差距</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {stabilityMetrics ? stabilityMetrics.scoreGap.toFixed(2) : 'N/A'}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <BarChart3 className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {stabilityMetrics ? `${stabilityMetrics.relativeGap.toFixed(1)}%` : ''}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">变化阈值</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {stabilityMetrics ? stabilityMetrics.minScoreChange.toFixed(2) : 'N/A'}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <AlertCircle className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">改变排名的最小值</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">自动测试</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {isAutoTestComplete ? autoTestResults.length : '运行中'}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-full">
                                {isAutoTestComplete ? (
                                    <Settings className="h-6 w-6 text-orange-600" />
                                ) : (
                                    <div className="animate-spin h-6 w-6 border-2 border-orange-600 border-t-transparent rounded-full"></div>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {isAutoTestComplete ? '个测试场景' : '正在运行测试'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* 检查是否有数据 */}
            {data.hypotheses.length === 0 || data.evidence.length === 0 || Object.keys(data.matrix).length === 0 ? (
                <Alert className="border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                        <strong>无法进行敏感性分析</strong>
                        <p className="mt-2">
                            需要完成前面的步骤才能进行敏感性分析：
                            <br />• 步骤1：添加假设
                            <br />• 步骤2：添加证据
                            <br />• 步骤3：完成矩阵评分
                        </p>
                    </AlertDescription>
                </Alert>
            ) : (
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="auto">自动测试</TabsTrigger>
                        <TabsTrigger value="single">单变量分析</TabsTrigger>
                        <TabsTrigger value="weight">权重分析</TabsTrigger>
                        <TabsTrigger value="stability">稳定性分析</TabsTrigger>
                    </TabsList>

                    <TabsContent value="auto" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">自动敏感性测试</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!isAutoTestComplete ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                        <p className="text-gray-600">正在运行自动敏感性测试...</p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            测试所有可能的评分变化、权重调整和可靠性变化
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* 筛选器 */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <Label className="text-sm font-medium">敏感性等级：</Label>
                                                    <Select value={sensitivityFilter} onValueChange={(value: 'all' | 'high' | 'medium' | 'low') => setSensitivityFilter(value)}>
                                                        <SelectTrigger className="w-32 h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">全部</SelectItem>
                                                            <SelectItem value="high">高敏感</SelectItem>
                                                            <SelectItem value="medium">中敏感</SelectItem>
                                                            <SelectItem value="low">低敏感</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Label className="text-sm font-medium">变动类型：</Label>
                                                    <Select value={typeFilter} onValueChange={(value: 'all' | 'single' | 'weight' | 'reliability') => setTypeFilter(value)}>
                                                        <SelectTrigger className="w-32 h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">全部</SelectItem>
                                                            <SelectItem value="single">评分变动</SelectItem>
                                                            <SelectItem value="weight">权重变动</SelectItem>
                                                            <SelectItem value="reliability">可靠性变动</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                共 {autoTestResults.filter(r =>
                                                    (sensitivityFilter === 'all' || r.sensitivity === sensitivityFilter) &&
                                                    (typeFilter === 'all' || r.type === typeFilter)
                                                ).length} 个测试场景
                                            </div>
                                        </div>

                                        {/* 测试结果汇总 */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                <h4 className="font-medium text-red-800 mb-2">高敏感性变化</h4>
                                                <p className="text-2xl font-bold text-red-600">
                                                    {autoTestResults.filter(r => r.sensitivity === 'high').length}
                                                </p>
                                                <p className="text-sm text-red-600">
                                                    影响超过20%的变化
                                                </p>
                                            </div>
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                                <h4 className="font-medium text-yellow-800 mb-2">中等敏感性变化</h4>
                                                <p className="text-2xl font-bold text-yellow-600">
                                                    {autoTestResults.filter(r => r.sensitivity === 'medium').length}
                                                </p>
                                                <p className="text-sm text-yellow-600">
                                                    影响10-20%的变化
                                                </p>
                                            </div>
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <h4 className="font-medium text-green-800 mb-2">低敏感性变化</h4>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {autoTestResults.filter(r => r.sensitivity === 'low').length}
                                                </p>
                                                <p className="text-sm text-green-600">
                                                    影响小于10%的变化
                                                </p>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* 按证据分组的敏感性发现 */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3">按证据分组的敏感性发现</h4>
                                            <div className="space-y-4">
                                                {data.evidence.map((evidence, evidenceIndex) => {
                                                    // 获取与该证据相关的所有敏感性发现，并应用筛选
                                                    const evidenceResults = autoTestResults.filter(r =>
                                                        r.evidenceId === evidence.id &&
                                                        (sensitivityFilter === 'all' || r.sensitivity === sensitivityFilter) &&
                                                        (typeFilter === 'all' || r.type === typeFilter)
                                                    );

                                                    if (evidenceResults.length === 0) return null;

                                                    // 按敏感性等级分组
                                                    const highResults = evidenceResults.filter(r => r.sensitivity === 'high');
                                                    const mediumResults = evidenceResults.filter(r => r.sensitivity === 'medium');
                                                    const lowResults = evidenceResults.filter(r => r.sensitivity === 'low');

                                                    return (
                                                        <div key={evidence.id} className="border border-gray-200 rounded-lg p-4">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center space-x-2">
                                                                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                                                                        E{evidenceIndex + 1}
                                                                    </Badge>
                                                                    <h5 className="font-medium text-gray-900">
                                                                        {evidence.text.substring(0, 50)}...
                                                                    </h5>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    {highResults.length > 0 && (
                                                                        <Badge className="bg-red-100 text-red-800 text-xs">
                                                                            {highResults.length} 高敏感
                                                                        </Badge>
                                                                    )}
                                                                    {mediumResults.length > 0 && (
                                                                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                                                            {mediumResults.length} 中敏感
                                                                        </Badge>
                                                                    )}
                                                                    {lowResults.length > 0 && (
                                                                        <Badge className="bg-green-100 text-green-800 text-xs">
                                                                            {lowResults.length} 低敏感
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* 高敏感性发现 */}
                                                            {highResults.length > 0 && (
                                                                <div className="mb-3">
                                                                    <h6 className="text-sm font-medium text-red-700 mb-2">高敏感性变化</h6>
                                                                    <div className="space-y-2">
                                                                        {highResults.slice(0, 3).map((result, index) => (
                                                                            <div key={index} className="bg-red-50 border border-red-200 rounded p-2">
                                                                                <div className="flex items-center justify-between">
                                                                                    <div className="text-sm text-red-800">
                                                                                        {result.type === 'single' && (
                                                                                            <>
                                                                                                H{data.hypotheses.findIndex(h => h.id === result.hypothesisId) + 1}
                                                                                                评分: {result.originalScore} → {result.newScore}
                                                                                            </>
                                                                                        )}
                                                                                        {result.type === 'weight' && (
                                                                                            <>权重: {result.originalWeight}% → {result.newWeight}%</>
                                                                                        )}
                                                                                        {result.type === 'reliability' && (
                                                                                            <>可靠性: {result.originalReliability}% → {result.newReliability}%</>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="text-xs text-red-600 font-medium">
                                                                                        影响: {result.maxChange.toFixed(1)}%
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                        {highResults.length > 3 && (
                                                                            <p className="text-xs text-red-600">
                                                                                还有 {highResults.length - 3} 个高敏感性发现...
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* 中等敏感性发现 */}
                                                            {mediumResults.length > 0 && (
                                                                <div className="mb-3">
                                                                    <h6 className="text-sm font-medium text-yellow-700 mb-2">中等敏感性变化</h6>
                                                                    <div className="space-y-2">
                                                                        {mediumResults.slice(0, 2).map((result, index) => (
                                                                            <div key={index} className="bg-yellow-50 border border-yellow-200 rounded p-2">
                                                                                <div className="flex items-center justify-between">
                                                                                    <div className="text-sm text-yellow-800">
                                                                                        {result.type === 'single' && (
                                                                                            <>
                                                                                                H{data.hypotheses.findIndex(h => h.id === result.hypothesisId) + 1}
                                                                                                评分: {result.originalScore} → {result.newScore}
                                                                                            </>
                                                                                        )}
                                                                                        {result.type === 'weight' && (
                                                                                            <>权重: {result.originalWeight}% → {result.newWeight}%</>
                                                                                        )}
                                                                                        {result.type === 'reliability' && (
                                                                                            <>可靠性: {result.originalReliability}% → {result.newReliability}%</>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="text-xs text-yellow-600 font-medium">
                                                                                        影响: {result.maxChange.toFixed(1)}%
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                        {mediumResults.length > 2 && (
                                                                            <p className="text-xs text-yellow-600">
                                                                                还有 {mediumResults.length - 2} 个中等敏感性发现...
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* 证据总结 */}
                                                            <div className="bg-gray-50 p-2 rounded text-xs text-gray-600">
                                                                <strong>证据敏感性总结：</strong>
                                                                该证据共有 {evidenceResults.length} 个敏感性测试场景，
                                                                其中 {highResults.length} 个高敏感、{mediumResults.length} 个中敏感、{lowResults.length} 个低敏感。
                                                                {highResults.length > 0 && '建议重点关注该证据的评分准确性。'}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* 稳健性评估 */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3">稳健性评估</h4>
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h5 className="font-medium text-blue-800 mb-2">结论稳定性</h5>
                                                        <p className="text-sm text-blue-700">
                                                            {autoTestResults.filter(r =>
                                                                (sensitivityFilter === 'all' || r.sensitivity === sensitivityFilter) &&
                                                                (typeFilter === 'all' || r.type === typeFilter) &&
                                                                r.rankingChanges > 0
                                                            ).length === 0 ?
                                                                '极其稳定 - 没有发现任何会改变假设排名的敏感性因素' :
                                                                autoTestResults.filter(r =>
                                                                    (sensitivityFilter === 'all' || r.sensitivity === sensitivityFilter) &&
                                                                    (typeFilter === 'all' || r.type === typeFilter) &&
                                                                    r.rankingChanges > 0 && r.sensitivity === 'high'
                                                                ).length === 0 ?
                                                                    '较为稳定 - 高敏感性变化不会改变假设排名' :
                                                                    autoTestResults.filter(r =>
                                                                        (sensitivityFilter === 'all' || r.sensitivity === sensitivityFilter) &&
                                                                        (typeFilter === 'all' || r.type === typeFilter) &&
                                                                        r.rankingChanges > 0 && r.sensitivity === 'high'
                                                                    ).length <= 3 ?
                                                                        '一般稳定 - 少数高敏感性变化可能改变假设排名' :
                                                                        '不稳定 - 多个高敏感性变化会改变假设排名'
                                                            }
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h5 className="font-medium text-blue-800 mb-2">建议</h5>
                                                        <p className="text-sm text-blue-700">
                                                            {autoTestResults.filter(r =>
                                                                (sensitivityFilter === 'all' || r.sensitivity === sensitivityFilter) &&
                                                                (typeFilter === 'all' || r.type === typeFilter) &&
                                                                r.sensitivity === 'high'
                                                            ).length === 0 ?
                                                                '结论可靠，可以进入下一步分析' :
                                                                autoTestResults.filter(r =>
                                                                    (sensitivityFilter === 'all' || r.sensitivity === sensitivityFilter) &&
                                                                    (typeFilter === 'all' || r.type === typeFilter) &&
                                                                    r.sensitivity === 'high'
                                                                ).length <= 5 ?
                                                                    '建议重点关注高敏感性因素，验证相关评分' :
                                                                    '建议重新审视评分和权重设置，增加更多证据'
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="single" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">单变量敏感性分析</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* 测试参数设置 */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium">选择假设</Label>
                                            <Select value={selectedHypothesis} onValueChange={setSelectedHypothesis}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="选择假设" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {data.hypotheses.map((hypothesis, index) => (
                                                        <SelectItem key={hypothesis.id} value={hypothesis.id}>
                                                            H{index + 1}: {hypothesis.text.substring(0, 30)}...
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">选择证据</Label>
                                            <Select value={selectedEvidence} onValueChange={setSelectedEvidence}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="选择证据" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {data.evidence.map((evidence, index) => (
                                                        <SelectItem key={evidence.id} value={evidence.id}>
                                                            E{index + 1}: {evidence.text.substring(0, 30)}...
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">测试评分</Label>
                                            <Select value={testScore.toString()} onValueChange={(value) => setTestScore(parseInt(value))}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="-2">-2 (强烈反对)</SelectItem>
                                                    <SelectItem value="-1">-1 (反对)</SelectItem>
                                                    <SelectItem value="0">0 (中性)</SelectItem>
                                                    <SelectItem value="1">1 (支持)</SelectItem>
                                                    <SelectItem value="2">2 (强烈支持)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-end">
                                            <Button
                                                onClick={runSensitivityTest}
                                                disabled={!selectedHypothesis || !selectedEvidence}
                                                className="w-full"
                                            >
                                                <Play className="w-4 h-4 mr-2" />
                                                运行测试
                                            </Button>
                                        </div>
                                    </div>

                                    {/* 当前设置显示 */}
                                    {selectedHypothesis && selectedEvidence && (
                                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                            <h4 className="font-medium text-gray-900 mb-2">当前测试设置</h4>
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <p><strong>假设:</strong> {data.hypotheses.find(h => h.id === selectedHypothesis)?.text}</p>
                                                <p><strong>证据:</strong> {data.evidence.find(e => e.id === selectedEvidence)?.text}</p>
                                                <p><strong>原始评分:</strong> {getMatrixScore(selectedHypothesis, selectedEvidence)}</p>
                                                <p><strong>测试评分:</strong> {testScore}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* 测试结果 */}
                                    {singleTestResults && singleTestResults.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="font-medium text-gray-900">测试结果</h4>
                                            {singleTestResults.map((result) => {
                                                const hypothesis = data.hypotheses.find(h => h.id === result.hypothesisId);
                                                return (
                                                    <div key={result.hypothesisId} className="p-3 border border-gray-200 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                <Badge variant="outline" className="text-blue-600 border-blue-200">
                                                                    H{data.hypotheses.findIndex(h => h.id === result.hypothesisId) + 1}
                                                                </Badge>
                                                                <span className="text-sm font-medium">{hypothesis?.text.substring(0, 40)}...</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-sm">
                                                                    <span className="text-gray-600">得分: </span>
                                                                    <span className="font-medium">{result.originalScore.toFixed(2)}</span>
                                                                    <span className="mx-1">→</span>
                                                                    <span className="font-medium">{result.newScore.toFixed(2)}</span>
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    变化: {result.change > 0 ? '+' : ''}{result.change.toFixed(2)}
                                                                    ({result.changePercent > 0 ? '+' : ''}{result.changePercent.toFixed(1)}%)
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {result.rankingChange !== 0 && (
                                                            <div className="mt-2 text-sm">
                                                                <Badge variant="outline" className={result.rankingChange > 0 ? 'text-red-600 border-red-200' : 'text-green-600 border-green-200'}>
                                                                    排名变化: {result.originalRanking} → {result.ranking}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="weight" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">权重敏感性分析</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                        调整证据权重，观察对假设排序的影响
                                    </p>

                                    <div className="space-y-4">
                                        {data.evidence.map((evidence, index) => {
                                            const adjustedWeight = weightAdjustments[evidence.id] ?? evidence.weight;
                                            return (
                                                <div key={evidence.id} className="p-4 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center space-x-2">
                                                            <Badge variant="outline" className="text-purple-600 border-purple-200">
                                                                E{index + 1}
                                                            </Badge>
                                                            <span className="text-sm font-medium">
                                                                {evidence.text.substring(0, 40)}...
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            原始权重: {evidence.weight}%
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center space-x-4">
                                                            <Label className="text-sm font-medium w-20">调整权重:</Label>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="100"
                                                                value={adjustedWeight}
                                                                onChange={(e) => setWeightAdjustments(prev => ({
                                                                    ...prev,
                                                                    [evidence.id]: parseInt(e.target.value)
                                                                }))}
                                                                className="flex-1"
                                                            />
                                                            <span className="text-sm font-medium w-12">{adjustedWeight}%</span>
                                                        </div>

                                                        {adjustedWeight !== evidence.weight && (
                                                            <div className="text-xs text-gray-500">
                                                                变化: {adjustedWeight > evidence.weight ? '+' : ''}{adjustedWeight - evidence.weight}%
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button
                                            onClick={() => setWeightAdjustments({})}
                                            variant="outline"
                                            size="sm"
                                        >
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            重置权重
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>



                    <TabsContent value="stability" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">稳定性分析</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* 稳定性指标 */}
                                    {stabilityMetrics && (
                                        <div className="space-y-4">
                                            <h4 className="font-medium text-gray-900">稳定性指标</h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <h5 className="font-medium text-blue-800 mb-2">排名稳定性</h5>
                                                    <p className={`text-lg font-bold ${getStabilityColor(stabilityMetrics.stabilityLevel)}`}>
                                                        {getStabilityLabel(stabilityMetrics.stabilityLevel)}
                                                    </p>
                                                    <p className="text-sm text-blue-700 mt-1">
                                                        相对差距: {stabilityMetrics.relativeGap.toFixed(1)}%
                                                    </p>
                                                </div>

                                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                                    <h5 className="font-medium text-green-800 mb-2">敏感性阈值</h5>
                                                    <p className="text-lg font-bold text-green-600">
                                                        {stabilityMetrics.minScoreChange.toFixed(2)}
                                                    </p>
                                                    <p className="text-sm text-green-700 mt-1">
                                                        改变排名所需最小变化
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                                <h5 className="font-medium text-gray-800 mb-2">竞争关系</h5>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center justify-between">
                                                        <span>第1名: {stabilityMetrics.topHypothesis}</span>
                                                        <span className="font-medium text-green-600">
                                                            {originalRanking[0]?.score.weighted.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span>第2名: {stabilityMetrics.secondHypothesis}</span>
                                                        <span className="font-medium text-blue-600">
                                                            {originalRanking[1]?.score.weighted.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between border-t pt-2">
                                                        <span className="font-medium">得分差距:</span>
                                                        <span className="font-medium text-orange-600">
                                                            {stabilityMetrics.scoreGap.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 稳定性建议 */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">稳定性建议</h4>
                                        <div className="space-y-2">
                                            {stabilityMetrics?.stabilityLevel === 'high' && (
                                                <Alert className="border-green-200 bg-green-50">
                                                    <AlertDescription className="text-green-800">
                                                        <strong>高稳定性:</strong> 结论较为稳定，单个评分变化不太可能改变主要结论。
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                            {stabilityMetrics?.stabilityLevel === 'medium' && (
                                                <Alert className="border-yellow-200 bg-yellow-50">
                                                    <AlertDescription className="text-yellow-800">
                                                        <strong>中等稳定性:</strong> 需要关注关键证据的评分变化，建议进行敏感性测试。
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                            {(stabilityMetrics?.stabilityLevel === 'low' || stabilityMetrics?.stabilityLevel === 'very-low') && (
                                                <Alert className="border-red-200 bg-red-50">
                                                    <AlertDescription className="text-red-800">
                                                        <strong>低稳定性:</strong> 结论对评分变化敏感，建议收集更多证据或重新评估现有证据。
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}

            {/* 导出按钮 */}
            <div className="flex justify-end">
                <Button onClick={exportSensitivityReport} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    导出敏感性报告
                </Button>
            </div>

            {/* 进度指示器 */}
            {isAutoTestComplete && stabilityMetrics && (
                <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm">
                                    敏感性分析完成 - 稳定性: {getStabilityLabel(stabilityMetrics.stabilityLevel)}
                                </span>
                            </div>
                            <div className="text-sm text-green-700">
                                发现 {autoTestResults.filter(r => r.sensitivity === 'high').length} 个高敏感性因素
                            </div>
                            <div className="text-sm text-green-700">
                                可以进入下一步生成报告
                            </div>
                        </div>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}; 
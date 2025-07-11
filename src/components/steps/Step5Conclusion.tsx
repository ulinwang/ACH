import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Edit3, Save, X, TrendingUp, AlertTriangle, CheckCircle, Eye, Lightbulb, BarChart3, Download, History } from 'lucide-react';
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

interface ConclusionData {
    id: string;
    primaryHypothesis: string;
    confidence: number;
    reasoning: string;
    keyEvidence: string[];
    limitations: string;
    recommendations: string;
    timestamp: Date;
}

export const Step5Conclusion: React.FC = () => {
    const { data, updateConclusion } = useAnalysisStore();
    const [isEditing, setIsEditing] = useState(false);
    const [selectedTab, setSelectedTab] = useState('conclusion');
    const [editingConclusion, setEditingConclusion] = useState<Partial<ConclusionData>>({});
    const [showUncertainty, setShowUncertainty] = useState(false);
    const [conclusionHistory, setConclusionHistory] = useState<ConclusionData[]>([]);

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

    const topHypothesis = rankedHypotheses[0];

    // 识别关键证据
    const identifyKeyEvidence = (hypothesis: any) => {
        return data.evidence
            .map(evidence => ({
                ...evidence,
                impact: Math.abs(getMatrixScore(hypothesis.id, evidence.id)) * (evidence.weight / 100) * (evidence.reliability / 100)
            }))
            .sort((a, b) => b.impact - a.impact)
            .slice(0, 3);
    };

    const keyEvidence = topHypothesis ? identifyKeyEvidence(topHypothesis) : [];

    // 计算整体置信度
    const calculateOverallConfidence = () => {
        if (!topHypothesis || rankedHypotheses.length < 2) return 0;

        const firstScore = rankedHypotheses[0].score.weighted;
        const secondScore = rankedHypotheses[1]?.score.weighted || 0;
        const gap = firstScore - secondScore;

        // 基于得分差距、证据数量、矩阵完成度计算置信度
        const totalCells = data.hypotheses.length * data.evidence.length;
        const filledCells = Object.keys(data.matrix).length;
        const completionRate = totalCells > 0 ? filledCells / totalCells : 0;

        const confidence = Math.min(
            ((gap / 2) * 0.4 + completionRate * 0.3 + (data.evidence.length / 10) * 0.3) * 100,
            100
        );

        return Math.max(confidence, 0);
    };

    const overallConfidence = calculateOverallConfidence();

    // 自动生成结论
    const generateAutoConclusion = () => {
        if (!topHypothesis) return null;

        const confidence = overallConfidence;
        const confidenceText =
            confidence >= 80 ? '高度' :
                confidence >= 60 ? '中等' :
                    confidence >= 40 ? '较低' : '低';

        const reasoning = `
基于ACH分析结果，假设"${topHypothesis.text}"获得了最高的综合评分（${topHypothesis.score.weighted.toFixed(2)}分）。
该假设在${topHypothesis.score.count}个证据上进行了评分，平均得分为${topHypothesis.score.average.toFixed(2)}分。

与其他假设相比，该假设${rankedHypotheses.length > 1 ? `比第二名假设高出${(topHypothesis.score.weighted - rankedHypotheses[1].score.weighted).toFixed(2)}分` : '明显优于其他假设'}。

结论置信度评估为${confidenceText}（${confidence.toFixed(1)}%）。
        `.trim();

        const keyEvidenceTexts = keyEvidence.map(e => e.text);

        const limitations = `
本分析的局限性包括：
1. 矩阵评分基于当前可获得的证据，可能存在遗漏的重要信息
2. 评分过程中可能包含主观判断，影响结果的客观性
3. 证据的权重和可靠性评估可能需要进一步验证
4. 分析结果应结合其他分析方法进行综合判断
        `.trim();

        const recommendations = `
基于本次分析，建议：
1. 进一步收集支持或反对主要假设的证据
2. 对关键证据进行深入验证和分析
3. 考虑进行敏感性分析，评估结论的稳定性
4. 定期回顾和更新分析，确保结论的时效性
        `.trim();

        return {
            primaryHypothesis: topHypothesis.text,
            confidence: Math.round(confidence),
            reasoning,
            keyEvidence: keyEvidenceTexts,
            limitations,
            recommendations,
            timestamp: new Date()
        };
    };

    const autoConclusion = generateAutoConclusion();

    const handleSaveConclusion = () => {
        if (autoConclusion) {
            const conclusion = {
                ...autoConclusion,
                ...editingConclusion,
                id: Date.now().toString(),
                timestamp: new Date()
            };

            updateConclusion(conclusion);
            setConclusionHistory(prev => [conclusion, ...prev]);
            setIsEditing(false);
            setEditingConclusion({});
        }
    };

    const handleEditConclusion = () => {
        setIsEditing(true);
        setEditingConclusion(autoConclusion || {});
    };

    const exportConclusion = () => {
        if (!autoConclusion) return;

        const conclusion = { ...autoConclusion, ...editingConclusion };
        const content = `
ACH分析结论报告
================

分析主题: ${data.title}
分析时间: ${new Date().toLocaleDateString()}

主要结论
--------
${conclusion.primaryHypothesis}

置信度: ${conclusion.confidence}%

分析依据
--------
${conclusion.reasoning}

关键证据
--------
${conclusion.keyEvidence.map((e, i) => `${i + 1}. ${e}`).join('\n')}

局限性
------
${conclusion.limitations}

建议
----
${conclusion.recommendations}

假设排序
--------
${rankedHypotheses.map((h, i) => `${i + 1}. ${h.text} (得分: ${h.score.weighted.toFixed(2)})`).join('\n')}
        `.trim();

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ACH_结论报告_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 80) return 'text-green-600';
        if (confidence >= 60) return 'text-yellow-600';
        if (confidence >= 40) return 'text-orange-600';
        return 'text-red-600';
    };

    const getConfidenceLabel = (confidence: number) => {
        if (confidence >= 80) return '高度置信';
        if (confidence >= 60) return '中等置信';
        if (confidence >= 40) return '较低置信';
        return '低置信';
    };

    return (
        <div className="space-y-6">
            {/* 提示信息 */}
            <Alert className="border-blue-200 bg-blue-50">
                <Target className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                    <strong>结论生成指南：</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                        <li>• 基于矩阵分析结果自动生成初步结论</li>
                        <li>• 识别最有可能的假设和关键证据</li>
                        <li>• 评估结论的置信度和局限性</li>
                        <li>• 可手动编辑和完善结论内容</li>
                    </ul>
                </AlertDescription>
            </Alert>

            {/* 统计信息 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">整体置信度</p>
                                <p className={`text-2xl font-bold ${getConfidenceColor(overallConfidence)}`}>
                                    {overallConfidence.toFixed(1)}%
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Target className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{getConfidenceLabel(overallConfidence)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">主要假设</p>
                                <p className="text-lg font-bold text-green-600">
                                    {topHypothesis ? `H${data.hypotheses.findIndex(h => h.id === topHypothesis.id) + 1}` : 'N/A'}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {topHypothesis ? `得分: ${topHypothesis.score.weighted.toFixed(2)}` : '无数据'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">关键证据</p>
                                <p className="text-2xl font-bold text-purple-600">{keyEvidence.length}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <Eye className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">影响最大的证据</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">假设数量</p>
                                <p className="text-2xl font-bold text-orange-600">{rankedHypotheses.length}</p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-full">
                                <BarChart3 className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">参与分析的假设</p>
                    </CardContent>
                </Card>
            </div>

            {/* 检查是否有数据 */}
            {data.hypotheses.length === 0 || data.evidence.length === 0 || Object.keys(data.matrix).length === 0 ? (
                <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                        <strong>无法生成结论</strong>
                        <p className="mt-2">
                            需要完成前面的步骤才能生成结论：
                            <br />• 步骤1：添加假设
                            <br />• 步骤2：添加证据
                            <br />• 步骤3：完成矩阵评分
                        </p>
                    </AlertDescription>
                </Alert>
            ) : (
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="conclusion">结论总结</TabsTrigger>
                        <TabsTrigger value="ranking">假设排序</TabsTrigger>
                        <TabsTrigger value="analysis">深度分析</TabsTrigger>
                    </TabsList>

                    <TabsContent value="conclusion" className="space-y-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg">分析结论</CardTitle>
                                <div className="flex space-x-2">
                                    {!isEditing ? (
                                        <Button size="sm" onClick={handleEditConclusion}>
                                            <Edit3 className="w-4 h-4 mr-2" />
                                            编辑结论
                                        </Button>
                                    ) : (
                                        <>
                                            <Button size="sm" onClick={handleSaveConclusion}>
                                                <Save className="w-4 h-4 mr-2" />
                                                保存
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                                                <X className="w-4 h-4 mr-2" />
                                                取消
                                            </Button>
                                        </>
                                    )}
                                    <Button size="sm" variant="outline" onClick={exportConclusion}>
                                        <Download className="w-4 h-4 mr-2" />
                                        导出报告
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {autoConclusion && (
                                    <div className="space-y-6">
                                        {/* 主要结论 */}
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700 mb-2 block">主要结论</Label>
                                            {isEditing ? (
                                                <Input
                                                    value={editingConclusion.primaryHypothesis || autoConclusion.primaryHypothesis}
                                                    onChange={(e) => setEditingConclusion(prev => ({ ...prev, primaryHypothesis: e.target.value }))}
                                                    className="w-full"
                                                />
                                            ) : (
                                                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                                                    <p className="text-green-800 font-medium">
                                                        {editingConclusion.primaryHypothesis || autoConclusion.primaryHypothesis}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* 置信度 */}
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700 mb-2 block">置信度评估</Label>
                                            {isEditing ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={editingConclusion.confidence || autoConclusion.confidence}
                                                        onChange={(e) => setEditingConclusion(prev => ({ ...prev, confidence: parseInt(e.target.value) }))}
                                                        className="w-full"
                                                    />
                                                    <div className="flex justify-between text-sm text-gray-600">
                                                        <span>0%</span>
                                                        <span className="font-medium">{editingConclusion.confidence || autoConclusion.confidence}%</span>
                                                        <span>100%</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-blue-800">
                                                            {getConfidenceLabel(editingConclusion.confidence || autoConclusion.confidence)}
                                                        </span>
                                                        <span className={`font-bold ${getConfidenceColor(editingConclusion.confidence || autoConclusion.confidence)}`}>
                                                            {editingConclusion.confidence || autoConclusion.confidence}%
                                                        </span>
                                                    </div>
                                                    <Progress value={editingConclusion.confidence || autoConclusion.confidence} className="h-2" />
                                                </div>
                                            )}
                                        </div>

                                        {/* 分析依据 */}
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700 mb-2 block">分析依据</Label>
                                            {isEditing ? (
                                                <textarea
                                                    value={editingConclusion.reasoning || autoConclusion.reasoning}
                                                    onChange={(e) => setEditingConclusion(prev => ({ ...prev, reasoning: e.target.value }))}
                                                    className="w-full p-3 border border-gray-300 rounded-md h-32 text-sm"
                                                />
                                            ) : (
                                                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                                                    <p className="text-gray-800 whitespace-pre-line text-sm">
                                                        {editingConclusion.reasoning || autoConclusion.reasoning}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* 关键证据 */}
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700 mb-2 block">关键证据</Label>
                                            <div className="space-y-2">
                                                {keyEvidence.map((evidence, index) => (
                                                    <div key={evidence.id} className="flex items-start space-x-2 p-2 bg-purple-50 border border-purple-200 rounded-md">
                                                        <Badge variant="outline" className="text-purple-600 border-purple-300 mt-1">
                                                            E{data.evidence.findIndex(e => e.id === evidence.id) + 1}
                                                        </Badge>
                                                        <div className="flex-1">
                                                            <p className="text-sm text-purple-800">{evidence.text}</p>
                                                            <p className="text-xs text-purple-600 mt-1">
                                                                影响分数: {evidence.impact.toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 局限性 */}
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700 mb-2 block">分析局限性</Label>
                                            {isEditing ? (
                                                <textarea
                                                    value={editingConclusion.limitations || autoConclusion.limitations}
                                                    onChange={(e) => setEditingConclusion(prev => ({ ...prev, limitations: e.target.value }))}
                                                    className="w-full p-3 border border-gray-300 rounded-md h-24 text-sm"
                                                />
                                            ) : (
                                                <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                                                    <p className="text-orange-800 whitespace-pre-line text-sm">
                                                        {editingConclusion.limitations || autoConclusion.limitations}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* 建议 */}
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700 mb-2 block">后续建议</Label>
                                            {isEditing ? (
                                                <textarea
                                                    value={editingConclusion.recommendations || autoConclusion.recommendations}
                                                    onChange={(e) => setEditingConclusion(prev => ({ ...prev, recommendations: e.target.value }))}
                                                    className="w-full p-3 border border-gray-300 rounded-md h-24 text-sm"
                                                />
                                            ) : (
                                                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                                                    <p className="text-green-800 whitespace-pre-line text-sm">
                                                        {editingConclusion.recommendations || autoConclusion.recommendations}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="ranking" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">假设排序详情</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {rankedHypotheses.map((hypothesis, index) => (
                                        <div key={hypothesis.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="flex-shrink-0">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-yellow-500 text-white' :
                                                    index === 1 ? 'bg-gray-400 text-white' :
                                                        index === 2 ? 'bg-orange-400 text-white' :
                                                            'bg-gray-200 text-gray-600'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                                                        H{data.hypotheses.findIndex(h => h.id === hypothesis.id) + 1}
                                                    </Badge>
                                                    <span className="font-medium text-gray-900">{hypothesis.text}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-600">综合得分:</span>
                                                        <span className="ml-2 font-medium text-blue-600">{hypothesis.score.weighted.toFixed(2)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">平均分:</span>
                                                        <span className="ml-2 font-medium text-green-600">{hypothesis.score.average.toFixed(2)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">评分数:</span>
                                                        <span className="ml-2 font-medium text-purple-600">{hypothesis.score.count}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">原始分:</span>
                                                        <span className="ml-2 font-medium text-orange-600">{hypothesis.score.raw.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {index === 0 && (
                                                <div className="flex-shrink-0">
                                                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                                        <TrendingUp className="w-4 h-4 mr-1" />
                                                        最佳假设
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analysis" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">深度分析</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* 竞争假设分析 */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">竞争假设分析</h4>
                                        {rankedHypotheses.length > 1 ? (
                                            <div className="space-y-3">
                                                {rankedHypotheses.slice(1, 3).map((hypothesis, index) => (
                                                    <div key={hypothesis.id} className="p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                <Badge variant="outline" className="text-blue-600 border-blue-200">
                                                                    H{data.hypotheses.findIndex(h => h.id === hypothesis.id) + 1}
                                                                </Badge>
                                                                <span className="text-sm font-medium">{hypothesis.text}</span>
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                得分: {hypothesis.score.weighted.toFixed(2)}
                                                                <span className="ml-2 text-xs">
                                                                    (差距: {(rankedHypotheses[0].score.weighted - hypothesis.score.weighted).toFixed(2)})
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-600">只有一个假设，无法进行竞争分析</p>
                                        )}
                                    </div>

                                    <Separator />

                                    {/* 不确定性分析 */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">不确定性分析</h4>
                                        <div className="space-y-3">
                                            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                                <h5 className="font-medium text-orange-800 mb-2">主要不确定性因素</h5>
                                                <ul className="text-sm text-orange-700 space-y-1">
                                                    <li>• 矩阵完成度: {Math.round((Object.keys(data.matrix).length / (data.hypotheses.length * data.evidence.length)) * 100)}%</li>
                                                    <li>• 证据数量: {data.evidence.length}个 {data.evidence.length < 5 && '(建议增加更多证据)'}</li>
                                                    <li>• 假设间得分差距: {rankedHypotheses.length > 1 ? (rankedHypotheses[0].score.weighted - rankedHypotheses[1].score.weighted).toFixed(2) : 'N/A'}</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* 敏感性指标 */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">敏感性指标</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <h5 className="font-medium text-blue-800 mb-1">结论稳定性</h5>
                                                <p className="text-sm text-blue-700">
                                                    {rankedHypotheses.length > 1 && rankedHypotheses[0].score.weighted - rankedHypotheses[1].score.weighted > 0.5 ?
                                                        '稳定 - 主要假设具有明显优势' :
                                                        '不稳定 - 假设间差距较小'
                                                    }
                                                </p>
                                            </div>
                                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <h5 className="font-medium text-green-800 mb-1">证据充分性</h5>
                                                <p className="text-sm text-green-700">
                                                    {data.evidence.length >= 5 ?
                                                        '充分 - 证据数量足够' :
                                                        '不足 - 建议增加更多证据'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}

            {/* 进度指示器 */}
            {autoConclusion && (
                <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm">
                                    分析结论已生成 - 置信度: {overallConfidence.toFixed(1)}%
                                </span>
                            </div>
                            <div className="text-sm text-green-700">
                                可以进入下一步进行敏感性分析
                            </div>
                        </div>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}; 
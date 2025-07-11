import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Table, BarChart3, Calculator, Download, RefreshCw, Eye, AlertTriangle, TrendingUp, Target } from 'lucide-react';
import { useAnalysisStore } from '../../store/analysisStore';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface HypothesisScore {
    hypothesisId: string;
    score: number;
    count: number;
    average: number;
    rank: number;
}

// 悬浮卡片组件
const TooltipCard: React.FC<{
    children: React.ReactNode;
    content: string;
    title: string;
    isVisible: boolean;
}> = ({ children, content, title, isVisible }) => {
    return (
        <div className="relative inline-block">
            {children}
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-50 top-full mt-2 left-1/2 transform -translate-x-1/2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3"
                >
                    <div className="text-sm font-medium text-gray-900 mb-1">{title}</div>
                    <div className="text-xs text-gray-600 leading-relaxed">{content}</div>
                    {/* 小箭头 */}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-white"></div>
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-200"></div>
                </motion.div>
            )}
        </div>
    );
};

export const Step3Matrix: React.FC = () => {
    const { data, updateMatrixScore, clearMatrix } = useAnalysisStore();
    const [selectedTab, setSelectedTab] = useState('matrix');
    const [hoveredEvidence, setHoveredEvidence] = useState<string | null>(null);
    const [hoveredHypothesis, setHoveredHypothesis] = useState<string | null>(null);

    const getMatrixScore = (hypothesisId: string, evidenceId: string): number | null => {
        const key = `${hypothesisId}-${evidenceId}`;
        return data.matrix[key] ?? null;
    };

    const setMatrixScore = (hypothesisId: string, evidenceId: string, score: number) => {
        updateMatrixScore(hypothesisId, evidenceId, score);
    };

    const getScoreColor = (score: number | null) => {
        if (score === null) return 'bg-gray-100 text-gray-500';
        if (score === 0) return 'bg-blue-100 text-blue-700';
        if (score > 0) return score === 1 ? 'bg-green-100 text-green-700' : 'bg-green-200 text-green-800';
        return score === -1 ? 'bg-red-100 text-red-700' : 'bg-red-200 text-red-800';
    };

    const getScoreLabel = (score: number | null) => {
        if (score === null) return '未评分';
        switch (score) {
            case -2: return '强反对';
            case -1: return '弱反对';
            case 0: return '中性';
            case 1: return '弱支持';
            case 2: return '强支持';
            default: return '未评分';
        }
    };

    const getScoreSymbol = (score: number | null) => {
        if (score === null) return '';
        switch (score) {
            case -2: return '--';
            case -1: return '-';
            case 0: return '○';
            case 1: return '+';
            case 2: return '++';
            default: return '';
        }
    };

    // 计算假设得分
    const calculateHypothesisScores = (): HypothesisScore[] => {
        return data.hypotheses.map(hypothesis => {
            const validScores: number[] = [];

            data.evidence.forEach(evidence => {
                const score = getMatrixScore(hypothesis.id, evidence.id);
                if (score !== null) {
                    const weight = evidence.weight / 100;
                    const reliability = evidence.reliability / 100;
                    validScores.push(score * weight * reliability);
                }
            });

            const totalScore = validScores.reduce((sum, score) => sum + score, 0);
            const count = validScores.length;
            const average = count > 0 ? totalScore / count : 0;

            return {
                hypothesisId: hypothesis.id,
                score: totalScore,
                count,
                average,
                rank: 0
            };
        }).sort((a, b) => b.score - a.score).map((item, index) => ({
            ...item,
            rank: index + 1
        }));
    };

    const hypothesisScores = useMemo(() => calculateHypothesisScores(), [data.hypotheses, data.evidence, data.matrix]);

    const getMatrixCompletionRate = () => {
        const totalCells = data.hypotheses.length * data.evidence.length;
        const filledCells = Object.keys(data.matrix).length; // 只计算真正有评分的单元格
        return totalCells > 0 ? (filledCells / totalCells) * 100 : 0;
    };

    const exportMatrix = () => {
        const csvContent = [
            ['假设/证据', ...data.evidence.map((e, i) => `E${i + 1}`)],
            ...data.hypotheses.map((h, i) => [
                `H${i + 1}`,
                ...data.evidence.map(e => getMatrixScore(h.id, e.id))
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `ACH_Matrix_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const resetMatrix = () => {
        if (confirm('确定要重置所有矩阵评分吗？此操作不可撤销。')) {
            clearMatrix();
        }
    };

    const completionRate = getMatrixCompletionRate();

    return (
        <div className="space-y-6">
            {/* 提示信息 */}
            <Alert className="border-blue-200 bg-blue-50">
                <Table className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                    <strong>分析矩阵指南：</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                        <li>• 评分范围：-2(强反对) 到 +2(强支持)，0为中性</li>
                        <li>• 使用下拉选择器进行评分，考虑证据对假设的支持程度</li>
                        <li>• 悬停在标签上可查看完整的假设和证据内容</li>
                        <li>• 完成矩阵评分后查看假设排序和得分分析</li>
                    </ul>
                </AlertDescription>
            </Alert>

            {/* 统计信息 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">完成度</p>
                                <p className="text-2xl font-bold text-blue-600">{completionRate.toFixed(1)}%</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <BarChart3 className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">矩阵大小</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {data.hypotheses.length}×{data.evidence.length}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <Table className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">已评分</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {Object.keys(data.matrix).length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <Calculator className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">总单元格</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {data.hypotheses.length * data.evidence.length}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-full">
                                <Target className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 检查是否有数据 */}
            {data.hypotheses.length === 0 || data.evidence.length === 0 ? (
                <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                        <strong>无法构建矩阵</strong>
                        <p className="mt-2">
                            需要至少有1个假设和1个证据才能构建分析矩阵。
                            请先在步骤1中添加假设，在步骤2中添加证据。
                        </p>
                    </AlertDescription>
                </Alert>
            ) : (
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="matrix">分析矩阵</TabsTrigger>
                        <TabsTrigger value="results">结果分析</TabsTrigger>
                    </TabsList>

                    <TabsContent value="matrix" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">分析矩阵</CardTitle>
                                    <div className="flex space-x-2">
                                        <Button variant="outline" size="sm" onClick={exportMatrix}>
                                            <Download className="w-4 h-4 mr-2" />
                                            导出CSV
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={resetMatrix}>
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            重置矩阵
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="border border-gray-300 p-3 bg-gray-50 text-left min-w-[200px]">
                                                    假设 / 证据
                                                </th>
                                                {data.evidence.map((evidence, index) => (
                                                    <th key={evidence.id} className="border border-gray-300 p-3 bg-gray-50 text-center min-w-[120px]">
                                                        <div className="space-y-1">
                                                            <TooltipCard
                                                                content={evidence.text}
                                                                title={`证据 E${index + 1}`}
                                                                isVisible={hoveredEvidence === evidence.id}
                                                            >
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-purple-600 border-purple-200"
                                                                    onMouseEnter={() => setHoveredEvidence(evidence.id)}
                                                                    onMouseLeave={() => setHoveredEvidence(null)}
                                                                >
                                                                    E{index + 1}
                                                                </Badge>
                                                            </TooltipCard>
                                                            <div className="text-xs text-gray-600">
                                                                权重: {evidence.weight}%
                                                            </div>
                                                            <div className="text-xs text-gray-600">
                                                                可靠性: {evidence.reliability}%
                                                            </div>
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.hypotheses.map((hypothesis, hIndex) => (
                                                <tr key={hypothesis.id}>
                                                    <td className="border border-gray-300 p-3 bg-gray-50">
                                                        <div className="space-y-2">
                                                            <TooltipCard
                                                                content={hypothesis.text}
                                                                title={`假设 H${hIndex + 1}`}
                                                                isVisible={hoveredHypothesis === hypothesis.id}
                                                            >
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-blue-600 border-blue-200"
                                                                    onMouseEnter={() => setHoveredHypothesis(hypothesis.id)}
                                                                    onMouseLeave={() => setHoveredHypothesis(null)}
                                                                >
                                                                    H{hIndex + 1}
                                                                </Badge>
                                                            </TooltipCard>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {hypothesis.text.length > 50
                                                                    ? `${hypothesis.text.substring(0, 50)}...`
                                                                    : hypothesis.text
                                                                }
                                                            </div>
                                                            <div className="text-xs text-gray-600">
                                                                优先级: {hypothesis.priority}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {data.evidence.map((evidence, eIndex) => {
                                                        const score = getMatrixScore(hypothesis.id, evidence.id);
                                                        return (
                                                            <td key={evidence.id} className="border border-gray-300 p-2">
                                                                <div className="flex flex-col items-center space-y-2">
                                                                    <Select
                                                                        value={score === null ? '0' : score.toString()}
                                                                        onValueChange={(value) => {
                                                                            setMatrixScore(hypothesis.id, evidence.id, parseInt(value));
                                                                        }}
                                                                    >
                                                                        <SelectTrigger className="w-24 h-8">
                                                                            <SelectValue>
                                                                                <div className={`flex items-center justify-center w-6 h-6 rounded text-xs font-medium ${getScoreColor(score)}`}>
                                                                                    {getScoreSymbol(score)}
                                                                                </div>
                                                                            </SelectValue>
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="-2">
                                                                                <div className="flex items-center space-x-2">
                                                                                    <div className="w-4 h-4 bg-red-200 rounded flex items-center justify-center text-xs">--</div>
                                                                                    <span>强反对</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                            <SelectItem value="-1">
                                                                                <div className="flex items-center space-x-2">
                                                                                    <div className="w-4 h-4 bg-red-100 rounded flex items-center justify-center text-xs">-</div>
                                                                                    <span>弱反对</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                            <SelectItem value="0">
                                                                                <div className="flex items-center space-x-2">
                                                                                    <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center text-xs">○</div>
                                                                                    <span>中性</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                            <SelectItem value="1">
                                                                                <div className="flex items-center space-x-2">
                                                                                    <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center text-xs">+</div>
                                                                                    <span>弱支持</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                            <SelectItem value="2">
                                                                                <div className="flex items-center space-x-2">
                                                                                    <div className="w-4 h-4 bg-green-200 rounded flex items-center justify-center text-xs">++</div>
                                                                                    <span>强支持</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <div className="text-xs text-gray-600 text-center">
                                                                        {getScoreLabel(score)}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* 评分说明 */}
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">评分说明</h4>
                                    <div className="grid grid-cols-5 gap-2 text-xs">
                                        <div className="flex items-center space-x-1">
                                            <div className="w-4 h-4 bg-red-200 rounded"></div>
                                            <span>-- 强反对</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <div className="w-4 h-4 bg-red-100 rounded"></div>
                                            <span>- 弱反对</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <div className="w-4 h-4 bg-blue-100 rounded"></div>
                                            <span>○ 中性</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <div className="w-4 h-4 bg-green-100 rounded"></div>
                                            <span>+ 弱支持</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <div className="w-4 h-4 bg-green-200 rounded"></div>
                                            <span>++ 强支持</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="results" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">假设排序与得分</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {hypothesisScores.map((scoreData, index) => {
                                        const hypothesis = data.hypotheses.find(h => h.id === scoreData.hypothesisId);
                                        if (!hypothesis) return null;

                                        const maxScore = Math.max(...hypothesisScores.map(s => Math.abs(s.score)));
                                        const progressValue = maxScore > 0 ? (Math.abs(scoreData.score) / maxScore) * 100 : 0;

                                        return (
                                            <motion.div
                                                key={hypothesis.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="border border-gray-200 rounded-lg p-4"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                                                                H{data.hypotheses.findIndex(h => h.id === hypothesis.id) + 1}
                                                            </Badge>
                                                            <Badge className={`${scoreData.rank === 1 ? 'bg-gold-100 text-gold-800' :
                                                                scoreData.rank === 2 ? 'bg-silver-100 text-silver-800' :
                                                                    scoreData.rank === 3 ? 'bg-bronze-100 text-bronze-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                排名 #{scoreData.rank}
                                                            </Badge>
                                                            <span className="font-medium text-gray-900">
                                                                {hypothesis.text.length > 80
                                                                    ? `${hypothesis.text.substring(0, 80)}...`
                                                                    : hypothesis.text
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-600">综合得分</span>
                                                                <span className={`font-medium ${scoreData.score > 0 ? 'text-green-600' :
                                                                    scoreData.score < 0 ? 'text-red-600' : 'text-gray-600'
                                                                    }`}>
                                                                    {scoreData.score.toFixed(2)}
                                                                </span>
                                                            </div>
                                                            <Progress
                                                                value={progressValue}
                                                                className={`h-2 ${scoreData.score > 0 ? 'bg-green-100' :
                                                                    scoreData.score < 0 ? 'bg-red-100' : 'bg-gray-100'
                                                                    }`}
                                                            />
                                                            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                                                                <div>已评分证据: {scoreData.count}/{data.evidence.length}</div>
                                                                <div>平均得分: {scoreData.average.toFixed(2)}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {scoreData.rank <= 3 && (
                                                            <div className="text-2xl">
                                                                {scoreData.rank === 1 ? '🥇' : scoreData.rank === 2 ? '🥈' : '🥉'}
                                                            </div>
                                                        )}
                                                        {scoreData.score > 0 && (
                                                            <TrendingUp className="w-5 h-5 text-green-600" />
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* 分析建议 */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">分析建议</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {completionRate < 50 && (
                                        <Alert className="border-orange-200 bg-orange-50">
                                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                                            <AlertDescription className="text-orange-800">
                                                <strong>建议完善矩阵评分</strong>
                                                <p className="mt-1 text-sm">
                                                    当前完成度只有 {completionRate.toFixed(1)}%，建议对更多证据进行评分以提高分析准确性。
                                                </p>
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {hypothesisScores.length > 0 && (
                                        <Alert className="border-green-200 bg-green-50">
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                            <AlertDescription className="text-green-800">
                                                <strong>当前排名第一的假设</strong>
                                                <p className="mt-1 text-sm">
                                                    基于当前证据评分，排名最高的假设是 H{data.hypotheses.findIndex(h => h.id === hypothesisScores[0].hypothesisId) + 1}，
                                                    得分为 {hypothesisScores[0].score.toFixed(2)}。
                                                </p>
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {completionRate === 100 && (
                                        <Alert className="border-blue-200 bg-blue-50">
                                            <Eye className="h-4 w-4 text-blue-600" />
                                            <AlertDescription className="text-blue-800">
                                                <strong>矩阵评分完成</strong>
                                                <p className="mt-1 text-sm">
                                                    所有证据都已完成评分，可以进入下一步进行矩阵精简和优化。
                                                </p>
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}

            {/* 进度指示器 */}
            {data.hypotheses.length > 0 && data.evidence.length > 0 && (
                <Alert className="border-blue-200 bg-blue-50">
                    <AlertDescription className="text-blue-800">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm">
                                    矩阵完成度: {completionRate.toFixed(1)}%
                                    {completionRate >= 70 ? ' - 可以进入下一步' : ' - 建议完成更多评分'}
                                </span>
                            </div>
                            <div className="text-sm text-blue-700">
                                {Object.keys(data.matrix).length} / {data.hypotheses.length * data.evidence.length} 已评分
                            </div>
                        </div>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}; 
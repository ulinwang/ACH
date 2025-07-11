import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Trash2, AlertTriangle, TrendingUp, BarChart3, Target, Eye, Lightbulb, RefreshCw, CheckCircle, Plus, Edit3, Save, X } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

interface SimilarityResult {
    id1: string;
    id2: string;
    similarity: number;
    type: 'hypothesis' | 'evidence';
}

interface OptimizationSuggestion {
    id: string;
    type: 'remove_evidence' | 'merge_hypotheses' | 'add_evidence' | 'review_scores';
    title: string;
    description: string;
    targets: string[];
    severity: 'high' | 'medium' | 'low';
    reason: string;
}

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    suggestion: OptimizationSuggestion | null;
    onConfirm: () => void;
    mergeHypothesisName?: string;
    onMergeHypothesisNameChange?: (name: string) => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    isOpen,
    onClose,
    suggestion,
    onConfirm,
    mergeHypothesisName,
    onMergeHypothesisNameChange
}) => {
    if (!suggestion) return null;

    const getActionDescription = () => {
        switch (suggestion.type) {
            case 'remove_evidence':
                return {
                    title: '确认移除证据',
                    description: '您确定要移除这个证据吗？此操作将同时删除所有相关的矩阵评分。',
                    warning: '此操作不可撤销'
                };
            case 'merge_hypotheses':
                return {
                    title: '确认合并假设',
                    description: '您确定要合并这两个假设吗？系统将创建一个新的假设来替换它们。',
                    warning: '原假设及其评分将被删除'
                };
            default:
                return {
                    title: '确认操作',
                    description: '您确定要执行此操作吗？',
                    warning: ''
                };
        }
    };

    const actionInfo = getActionDescription();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{actionInfo.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600">{actionInfo.description}</p>
                        {actionInfo.warning && (
                            <Alert className="border-red-200 bg-red-50">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-800">
                                    <strong>警告：</strong> {actionInfo.warning}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 mb-1">{suggestion.title}</p>
                        <p className="text-sm text-gray-600">{suggestion.description}</p>
                    </div>

                    {suggestion.type === 'merge_hypotheses' && (
                        <div className="space-y-2">
                            <Label htmlFor="new-hypothesis-name" className="text-sm font-medium">
                                新假设名称 *
                            </Label>
                            <Input
                                id="new-hypothesis-name"
                                value={mergeHypothesisName || ''}
                                onChange={(e) => onMergeHypothesisNameChange?.(e.target.value)}
                                placeholder="请输入合并后的假设名称"
                            />
                        </div>
                    )}

                    <div className="flex space-x-2">
                        <Button
                            onClick={onConfirm}
                            disabled={suggestion.type === 'merge_hypotheses' && !mergeHypothesisName?.trim()}
                            className="flex-1"
                        >
                            确认执行
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            取消
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const Step4Refine: React.FC = () => {
    const { data, deleteEvidence, deleteHypothesis, addHypothesis, updateMatrixScore } = useAnalysisStore();
    const [selectedTab, setSelectedTab] = useState('suggestions');
    const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        suggestion: OptimizationSuggestion | null;
    }>({ isOpen: false, suggestion: null });
    const [mergeHypothesisName, setMergeHypothesisName] = useState('');

    const getMatrixScore = (hypothesisId: string, evidenceId: string): number => {
        const key = `${hypothesisId}-${evidenceId}`;
        return data.matrix[key] || 0;
    };

    // 计算证据的诊断价值
    const calculateEvidenceDiagnosticValue = (evidence: any) => {
        if (data.hypotheses.length === 0) return 0;

        const scores = data.hypotheses.map(h => Math.abs(getMatrixScore(h.id, evidence.id)));
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - 1, 2), 0) / scores.length;
        const maxScore = Math.max(...scores);
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

        // 诊断价值综合评分：方差 + 最大值 + 平均值
        const diagnosticValue = (variance * 0.4) + (maxScore * 0.3) + (avgScore * 0.3);
        return Math.min(diagnosticValue, 2); // 限制在0-2之间
    };

    // 计算假设相似度
    const calculateHypothesesSimilarity = (h1: any, h2: any) => {
        if (data.evidence.length === 0) return 0;

        const scores1 = data.evidence.map(e => getMatrixScore(h1.id, e.id));
        const scores2 = data.evidence.map(e => getMatrixScore(h2.id, e.id));

        // 计算皮尔逊相关系数
        const n = scores1.length;
        const sum1 = scores1.reduce((a, b) => a + b, 0);
        const sum2 = scores2.reduce((a, b) => a + b, 0);
        const sum1Sq = scores1.reduce((a, b) => a + b * b, 0);
        const sum2Sq = scores2.reduce((a, b) => a + b * b, 0);
        const pSum = scores1.reduce((sum, score1, i) => sum + score1 * scores2[i], 0);

        const num = pSum - (sum1 * sum2 / n);
        const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));

        if (den === 0) return 0;
        return Math.abs(num / den);
    };

    // 生成优化建议
    const generateOptimizationSuggestions = (): OptimizationSuggestion[] => {
        const suggestions: OptimizationSuggestion[] = [];

        // 1. 检测低价值证据
        data.evidence.forEach(evidence => {
            const diagnosticValue = calculateEvidenceDiagnosticValue(evidence);
            if (diagnosticValue < 0.5) {
                suggestions.push({
                    id: `low-evidence-${evidence.id}`,
                    type: 'remove_evidence',
                    title: '移除低价值证据',
                    description: `证据"${evidence.text.substring(0, 50)}..."的诊断价值较低`,
                    targets: [evidence.id],
                    severity: 'medium',
                    reason: `诊断价值: ${diagnosticValue.toFixed(2)}/2.0 - 该证据对区分假设的帮助有限`
                });
            }
        });

        // 2. 检测相似假设
        for (let i = 0; i < data.hypotheses.length; i++) {
            for (let j = i + 1; j < data.hypotheses.length; j++) {
                const h1 = data.hypotheses[i];
                const h2 = data.hypotheses[j];
                const similarity = calculateHypothesesSimilarity(h1, h2);

                if (similarity > 0.8) {
                    suggestions.push({
                        id: `similar-hypotheses-${h1.id}-${h2.id}`,
                        type: 'merge_hypotheses',
                        title: '合并相似假设',
                        description: `假设"${h1.text.substring(0, 30)}..."和"${h2.text.substring(0, 30)}..."高度相似`,
                        targets: [h1.id, h2.id],
                        severity: 'high',
                        reason: `相似度: ${(similarity * 100).toFixed(1)}% - 这些假设在证据评分上表现相似`
                    });
                }
            }
        }

        // 3. 检测缺失评分
        const totalCells = data.hypotheses.length * data.evidence.length;
        const filledCells = Object.keys(data.matrix).length;
        const completionRate = totalCells > 0 ? filledCells / totalCells : 0;

        if (completionRate < 0.7) {
            suggestions.push({
                id: 'incomplete-matrix',
                type: 'review_scores',
                title: '完善矩阵评分',
                description: '矩阵评分不够完整，建议补充缺失的评分',
                targets: [],
                severity: 'high',
                reason: `完成度: ${(completionRate * 100).toFixed(1)}% - 不完整的矩阵会影响分析结果的准确性`
            });
        }

        // 4. 检测证据不足
        if (data.evidence.length < 3) {
            suggestions.push({
                id: 'insufficient-evidence',
                type: 'add_evidence',
                title: '增加证据数量',
                description: '证据数量较少，建议增加更多证据以提高分析质量',
                targets: [],
                severity: 'medium',
                reason: `当前证据数: ${data.evidence.length} - 建议至少有5-7个证据进行有效分析`
            });
        }

        return suggestions;
    };

    const suggestions = useMemo(() => generateOptimizationSuggestions(), [data.hypotheses, data.evidence, data.matrix]);

    const evidenceAnalysis = useMemo(() => {
        return data.evidence.map(evidence => ({
            ...evidence,
            diagnosticValue: calculateEvidenceDiagnosticValue(evidence),
            scoreVariance: (() => {
                const scores = data.hypotheses.map(h => getMatrixScore(h.id, evidence.id));
                const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                return scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length;
            })()
        })).sort((a, b) => a.diagnosticValue - b.diagnosticValue);
    }, [data.evidence, data.hypotheses, data.matrix]);

    const hypothesisAnalysis = useMemo(() => {
        const analysis = [];
        for (let i = 0; i < data.hypotheses.length; i++) {
            for (let j = i + 1; j < data.hypotheses.length; j++) {
                const h1 = data.hypotheses[i];
                const h2 = data.hypotheses[j];
                const similarity = calculateHypothesesSimilarity(h1, h2);
                if (similarity > 0.5) {
                    analysis.push({
                        hypothesis1: h1,
                        hypothesis2: h2,
                        similarity
                    });
                }
            }
        }
        return analysis.sort((a, b) => b.similarity - a.similarity);
    }, [data.hypotheses, data.evidence, data.matrix]);

    const handleSuggestionClick = (suggestion: OptimizationSuggestion) => {
        if (suggestion.type === 'add_evidence' || suggestion.type === 'review_scores') {
            // 对于这些类型，只是标记为已应用，不需要确认
            setAppliedSuggestions(prev => new Set(prev).add(suggestion.id));
            return;
        }

        // 为合并假设设置默认名称
        if (suggestion.type === 'merge_hypotheses' && suggestion.targets.length > 1) {
            const h1 = data.hypotheses.find(h => h.id === suggestion.targets[0]);
            const h2 = data.hypotheses.find(h => h.id === suggestion.targets[1]);
            if (h1 && h2) {
                setMergeHypothesisName(`${h1.text.substring(0, 30)}与${h2.text.substring(0, 30)}的合并假设`);
            }
        }

        setConfirmDialog({ isOpen: true, suggestion });
    };

    const handleConfirmSuggestion = () => {
        const { suggestion } = confirmDialog;
        if (!suggestion) return;

        switch (suggestion.type) {
            case 'remove_evidence':
                if (suggestion.targets.length > 0) {
                    deleteEvidence(suggestion.targets[0]);
                }
                break;
            case 'merge_hypotheses':
                if (suggestion.targets.length > 1 && mergeHypothesisName.trim()) {
                    // 获取两个假设的信息
                    const h1 = data.hypotheses.find(h => h.id === suggestion.targets[0]);
                    const h2 = data.hypotheses.find(h => h.id === suggestion.targets[1]);

                    if (h1 && h2) {
                        // 创建新假设，合并两个假设的属性
                        const newHypothesis = {
                            text: mergeHypothesisName.trim(),
                            confidence: Math.round((h1.confidence + h2.confidence) / 2),
                            priority: h1.priority, // 取第一个假设的优先级
                            reasoning: `合并假设：${h1.text} 和 ${h2.text}`
                        };

                        // 添加新假设
                        addHypothesis(newHypothesis);

                        // 删除原假设
                        deleteHypothesis(h1.id);
                        deleteHypothesis(h2.id);
                    }
                }
                break;
        }

        setAppliedSuggestions(prev => new Set(prev).add(suggestion.id));
        setConfirmDialog({ isOpen: false, suggestion: null });
        setMergeHypothesisName('');
    };

    const handleCancelConfirmation = () => {
        setConfirmDialog({ isOpen: false, suggestion: null });
        setMergeHypothesisName('');
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'high': return <AlertTriangle className="w-4 h-4" />;
            case 'medium': return <Eye className="w-4 h-4" />;
            case 'low': return <Lightbulb className="w-4 h-4" />;
            default: return <Target className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* 确认弹窗 */}
            <ConfirmationDialog
                isOpen={confirmDialog.isOpen}
                onClose={handleCancelConfirmation}
                suggestion={confirmDialog.suggestion}
                onConfirm={handleConfirmSuggestion}
                mergeHypothesisName={mergeHypothesisName}
                onMergeHypothesisNameChange={setMergeHypothesisName}
            />

            {/* 提示信息 */}
            <Alert className="border-blue-200 bg-blue-50">
                <Filter className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                    <strong>矩阵精简指南：</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                        <li>• 识别和移除低诊断价值的证据</li>
                        <li>• 合并相似的假设以简化分析</li>
                        <li>• 完善矩阵评分以提高准确性</li>
                        <li>• 优化证据质量和数量</li>
                    </ul>
                </AlertDescription>
            </Alert>

            {/* 统计信息 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">优化建议</p>
                                <p className="text-2xl font-bold text-orange-600">{suggestions.length}</p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-full">
                                <Lightbulb className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">低价值证据</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {evidenceAnalysis.filter(e => e.diagnosticValue < 0.5).length}
                                </p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-full">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">相似假设对</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {hypothesisAnalysis.filter(h => h.similarity > 0.8).length}
                                </p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <Target className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">已应用建议</p>
                                <p className="text-2xl font-bold text-green-600">{appliedSuggestions.size}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <CheckCircle className="h-6 w-6 text-green-600" />
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
                        <strong>无法进行矩阵精简</strong>
                        <p className="mt-2">
                            需要至少有1个假设和1个证据才能进行矩阵精简分析。
                            请先在步骤1中添加假设，在步骤2中添加证据。
                        </p>
                    </AlertDescription>
                </Alert>
            ) : (
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="suggestions">优化建议</TabsTrigger>
                        <TabsTrigger value="evidence">证据分析</TabsTrigger>
                        <TabsTrigger value="hypotheses">假设分析</TabsTrigger>
                    </TabsList>

                    <TabsContent value="suggestions" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">优化建议</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {suggestions.length === 0 ? (
                                    <div className="text-center py-8">
                                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                                        <p className="text-lg font-medium text-gray-900 mb-2">矩阵质量良好</p>
                                        <p className="text-sm text-gray-600">当前矩阵没有需要优化的明显问题</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {suggestions.map((suggestion) => (
                                            <div key={suggestion.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <Badge className={getSeverityColor(suggestion.severity)}>
                                                                {getSeverityIcon(suggestion.severity)}
                                                                <span className="ml-1 capitalize">{suggestion.severity}</span>
                                                            </Badge>
                                                            <span className="font-medium text-gray-900">{suggestion.title}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                                                        <p className="text-xs text-gray-500">{suggestion.reason}</p>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        {!appliedSuggestions.has(suggestion.id) && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleSuggestionClick(suggestion)}
                                                            >
                                                                {suggestion.type === 'remove_evidence' && <Trash2 className="w-4 h-4 mr-1" />}
                                                                {suggestion.type === 'merge_hypotheses' && <RefreshCw className="w-4 h-4 mr-1" />}
                                                                {suggestion.type === 'add_evidence' && <Plus className="w-4 h-4 mr-1" />}
                                                                {suggestion.type === 'review_scores' && <Edit3 className="w-4 h-4 mr-1" />}
                                                                应用
                                                            </Button>
                                                        )}
                                                        {appliedSuggestions.has(suggestion.id) && (
                                                            <Badge variant="outline" className="text-green-600 border-green-200">
                                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                                已应用
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="evidence" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">证据诊断价值分析</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {evidenceAnalysis.map((evidence, index) => (
                                        <div key={evidence.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <Badge variant="outline" className="text-purple-600 border-purple-200">
                                                            E{data.evidence.findIndex(e => e.id === evidence.id) + 1}
                                                        </Badge>
                                                        <span className="font-medium text-gray-900">
                                                            {evidence.text.substring(0, 50)}
                                                            {evidence.text.length > 50 && '...'}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div>
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-600">诊断价值</span>
                                                                <span className="font-medium">{evidence.diagnosticValue.toFixed(2)}/2.0</span>
                                                            </div>
                                                            <Progress value={(evidence.diagnosticValue / 2) * 100} className="h-2" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-600">评分方差</span>
                                                                <span className="font-medium">{evidence.scoreVariance.toFixed(2)}</span>
                                                            </div>
                                                            <Progress value={Math.min(evidence.scoreVariance / 2, 1) * 100} className="h-2" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {evidence.diagnosticValue < 0.5 && (
                                                        <Badge className="bg-red-100 text-red-800 border-red-200">
                                                            <AlertTriangle className="w-4 h-4 mr-1" />
                                                            低价值
                                                        </Badge>
                                                    )}
                                                    {evidence.diagnosticValue >= 1.5 && (
                                                        <Badge className="bg-green-100 text-green-800 border-green-200">
                                                            <TrendingUp className="w-4 h-4 mr-1" />
                                                            高价值
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="hypotheses" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">假设相似性分析</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {hypothesisAnalysis.length === 0 ? (
                                    <div className="text-center py-8">
                                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                                        <p className="text-lg font-medium text-gray-900 mb-2">假设区分度良好</p>
                                        <p className="text-sm text-gray-600">各假设之间的区分度较好，没有发现高度相似的假设</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {hypothesisAnalysis.map((analysis, index) => (
                                            <div key={`${analysis.hypothesis1.id}-${analysis.hypothesis2.id}`} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                                                                H{data.hypotheses.findIndex(h => h.id === analysis.hypothesis1.id) + 1}
                                                            </Badge>
                                                            <span className="text-gray-500">vs</span>
                                                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                                                                H{data.hypotheses.findIndex(h => h.id === analysis.hypothesis2.id) + 1}
                                                            </Badge>
                                                        </div>
                                                        <div className="space-y-2 text-sm">
                                                            <div>
                                                                <span className="font-medium">{analysis.hypothesis1.text.substring(0, 60)}...</span>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">{analysis.hypothesis2.text.substring(0, 60)}...</span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-3">
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-600">相似度</span>
                                                                <span className="font-medium">{(analysis.similarity * 100).toFixed(1)}%</span>
                                                            </div>
                                                            <Progress value={analysis.similarity * 100} className="h-2" />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {analysis.similarity > 0.8 && (
                                                            <Badge className="bg-red-100 text-red-800 border-red-200">
                                                                <AlertTriangle className="w-4 h-4 mr-1" />
                                                                高度相似
                                                            </Badge>
                                                        )}
                                                        {analysis.similarity > 0.6 && analysis.similarity <= 0.8 && (
                                                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                中度相似
                                                            </Badge>
                                                        )}
                                                    </div>
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
            {suggestions.length > 0 && (
                <Alert className="border-orange-200 bg-orange-50">
                    <AlertDescription className="text-orange-800">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <span className="text-sm">
                                    发现 {suggestions.length} 个优化建议
                                    {appliedSuggestions.size > 0 && ` - 已应用 ${appliedSuggestions.size} 个`}
                                </span>
                            </div>
                            <div className="text-sm text-orange-700">
                                建议处理后可提高分析质量
                            </div>
                        </div>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}; 
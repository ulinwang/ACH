import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Target, Lightbulb, Edit3, Save, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useAnalysisStore } from '../../store/analysisStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import type { Priority } from '../../types';

export const Step1Hypotheses: React.FC = () => {
    const { data, addHypothesis, updateHypothesis, deleteHypothesis, reorderHypotheses } = useAnalysisStore();
    const [newHypothesis, setNewHypothesis] = useState('');
    const [editingHypothesis, setEditingHypothesis] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [isAddingHypothesis, setIsAddingHypothesis] = useState(false);

    const handleAddHypothesis = () => {
        if (newHypothesis.trim()) {
            addHypothesis({
                text: newHypothesis.trim(),
                confidence: 50,
                priority: 'medium',
                reasoning: '',
            });
            setNewHypothesis('');
            setIsAddingHypothesis(false);
        }
    };

    const handleUpdateConfidence = (id: string, confidence: number) => {
        updateHypothesis(id, { confidence });
    };

    const handleUpdatePriority = (id: string, priority: Priority) => {
        updateHypothesis(id, { priority });
    };

    const startEdit = (id: string, text: string) => {
        setEditingHypothesis(id);
        setEditText(text);
    };

    const saveEdit = () => {
        if (editingHypothesis && editText.trim()) {
            updateHypothesis(editingHypothesis, { text: editText.trim() });
            setEditingHypothesis(null);
            setEditText('');
        }
    };

    const cancelEdit = () => {
        setEditingHypothesis(null);
        setEditText('');
    };

    const moveHypothesis = (id: string, direction: 'up' | 'down') => {
        const currentIndex = data.hypotheses.findIndex(h => h.id === id);
        if (currentIndex === -1) return;

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex >= 0 && newIndex < data.hypotheses.length) {
            reorderHypotheses(currentIndex, newIndex);
        }
    };

    const getPriorityColor = (priority: Priority) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityLabel = (priority: Priority) => {
        switch (priority) {
            case 'high':
                return '高';
            case 'medium':
                return '中';
            case 'low':
                return '低';
            default:
                return '未知';
        }
    };

    return (
        <div className="space-y-4">
            {/* 提示信息 */}
            <Alert className="border-blue-200 bg-blue-50">
                <Target className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                    <strong>假设管理指南：</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                        <li>• 制定3-7个相互排斥的假设</li>
                        <li>• 每个假设都应该是可证实或证伪的</li>
                        <li>• 设置初始置信度和优先级</li>
                        <li>• 可以通过拖拽调整假设顺序</li>
                    </ul>
                </AlertDescription>
            </Alert>

            {/* 添加假设按钮 */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">假设列表</h3>
                <Dialog open={isAddingHypothesis} onOpenChange={setIsAddingHypothesis}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            添加假设
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>添加新假设</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="hypothesis-text" className="text-sm font-medium">假设内容 *</Label>
                                <textarea
                                    id="hypothesis-text"
                                    value={newHypothesis}
                                    onChange={(e) => setNewHypothesis(e.target.value)}
                                    placeholder="请输入假设内容..."
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    rows={3}
                                />
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    onClick={handleAddHypothesis}
                                    disabled={!newHypothesis.trim()}
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    添加假设
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddingHypothesis(false);
                                        setNewHypothesis('');
                                    }}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    取消
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* 假设列表 - 多列式排列 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                    {data.hypotheses.map((hypothesis, index) => (
                        <motion.div
                            key={hypothesis.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="relative group"
                        >
                            <Card className="hover:shadow-sm transition-shadow h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                                                H{index + 1}
                                            </Badge>
                                            <Badge className={`${getPriorityColor(hypothesis.priority)} text-xs`}>
                                                {getPriorityLabel(hypothesis.priority)}优先级
                                            </Badge>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <div className="flex flex-col space-y-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => moveHypothesis(hypothesis.id, 'up')}
                                                    disabled={index === 0}
                                                    className="h-4 w-4 p-0"
                                                >
                                                    <ChevronUp className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => moveHypothesis(hypothesis.id, 'down')}
                                                    disabled={index === data.hypotheses.length - 1}
                                                    className="h-4 w-4 p-0"
                                                >
                                                    <ChevronDown className="w-3 h-3" />
                                                </Button>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => startEdit(hypothesis.id, hypothesis.text)}
                                                className="h-6 w-6 p-0"
                                            >
                                                <Edit3 className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => deleteHypothesis(hypothesis.id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    {editingHypothesis === hypothesis.id ? (
                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-sm">假设内容</Label>
                                                <textarea
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button size="sm" onClick={saveEdit}>
                                                    <Save className="w-3 h-3 mr-1" />
                                                    保存
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={cancelEdit}>
                                                    <X className="w-3 h-3 mr-1" />
                                                    取消
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-gray-900 leading-relaxed text-sm">
                                                {hypothesis.text}
                                            </p>

                                            <div className="space-y-2">
                                                <div>
                                                    <Label className="text-xs font-medium text-gray-700">
                                                        置信度: {hypothesis.confidence}%
                                                    </Label>
                                                    <Progress
                                                        value={hypothesis.confidence}
                                                        className="h-2 mt-1 cursor-pointer"
                                                        onClick={(e) => {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            const x = e.clientX - rect.left;
                                                            const percentage = Math.round((x / rect.width) * 100);
                                                            handleUpdateConfidence(hypothesis.id, Math.max(0, Math.min(100, percentage)));
                                                        }}
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="text-xs font-medium text-gray-700">
                                                        优先级
                                                    </Label>
                                                    <Select
                                                        value={hypothesis.priority}
                                                        onValueChange={(value: Priority) => handleUpdatePriority(hypothesis.id, value)}
                                                    >
                                                        <SelectTrigger className="mt-1 h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="high">高优先级</SelectItem>
                                                            <SelectItem value="medium">中优先级</SelectItem>
                                                            <SelectItem value="low">低优先级</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* 空状态 */}
            {data.hypotheses.length === 0 && (
                <Card className="border-dashed border-gray-300">
                    <CardContent className="p-8">
                        <div className="text-center text-gray-500">
                            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg mb-2">还没有添加假设</p>
                            <p className="text-sm mb-4">请添加需要分析的假设</p>
                            <Dialog open={isAddingHypothesis} onOpenChange={setIsAddingHypothesis}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        添加假设
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle>添加新假设</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="hypothesis-text" className="text-sm font-medium">假设内容 *</Label>
                                            <textarea
                                                id="hypothesis-text"
                                                value={newHypothesis}
                                                onChange={(e) => setNewHypothesis(e.target.value)}
                                                placeholder="请输入假设内容..."
                                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                onClick={handleAddHypothesis}
                                                disabled={!newHypothesis.trim()}
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                添加假设
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setIsAddingHypothesis(false);
                                                    setNewHypothesis('');
                                                }}
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                取消
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 进度指示器 */}
            {data.hypotheses.length > 0 && (
                <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm">
                                    已添加 {data.hypotheses.length} 个假设
                                    {data.hypotheses.length >= 3 ? ' - 可以进入下一步' : ' - 建议至少添加3个假设'}
                                </span>
                            </div>
                            <div className="text-sm text-green-700">
                                平均置信度: {Math.round(data.hypotheses.reduce((sum, h) => sum + h.confidence, 0) / data.hypotheses.length)}%
                            </div>
                        </div>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}; 
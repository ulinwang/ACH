import React from 'react';
import { HelpCircle, Lightbulb, Keyboard, BookOpen, Target, FileText, BarChart3, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';

export const HelpPage: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* 页面标题 */}
            <div className="flex items-center space-x-3">
                <HelpCircle className="h-8 w-8 text-blue-600" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">使用帮助</h1>
                    <p className="text-gray-600 mt-1">ACH分析工具完整使用指南</p>
                </div>
            </div>

            {/* 快速入门 */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center space-x-2">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                        <span>快速入门</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">ACH分析法简介</h3>
                            <p className="text-gray-600 leading-relaxed">
                                竞争性假设分析法（Analysis of Competing Hypotheses）是一种系统性的分析方法，
                                用于评估多个竞争性假设的相对可能性。该方法由美国中央情报局分析师开发，
                                广泛应用于情报分析、风险评估和决策支持等领域。
                            </p>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">核心理念</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• 通过系统性比较多个假设，减少认知偏差</li>
                                    <li>• 关注证据的诊断价值，而非简单的支持程度</li>
                                    <li>• 采用结构化的矩阵方法，提高分析透明度</li>
                                    <li>• 强调证伪思维，避免确认偏见</li>
                                </ul>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">8个分析步骤</h3>
                            <div className="space-y-3">
                                {[
                                    { step: 1, title: '提出假设', icon: '💡', desc: '基于议题提出多个竞争性假设' },
                                    { step: 2, title: '列出论据清单', icon: '📄', desc: '收集支持或反对各假设的证据' },
                                    { step: 3, title: '构建分析矩阵', icon: '📊', desc: '对假设-证据组合进行评分' },
                                    { step: 4, title: '精简矩阵', icon: '🔍', desc: '优化假设和证据，提高分析质量' },
                                    { step: 5, title: '得出初步结论', icon: '🎯', desc: '基于矩阵结果得出初步结论' },
                                    { step: 6, title: '分析证据敏感性', icon: '📈', desc: '测试关键证据变化的影响' },
                                    { step: 7, title: '报告结论', icon: '📋', desc: '生成完整的分析报告' },
                                    { step: 8, title: '高亮里程碑', icon: '🏁', desc: '设置后续监控的关键节点' }
                                ].map((item) => (
                                    <div key={item.step} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                                        <div className="text-2xl">{item.icon}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <Badge variant="outline">步骤 {item.step}</Badge>
                                                <span className="font-medium text-gray-900">{item.title}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 操作指南 */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center space-x-2">
                        <Target className="h-6 w-6 text-green-600" />
                        <span>详细操作指南</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Badge className="bg-blue-100 text-blue-800">项目管理</Badge>
                                    <h4 className="font-semibold text-gray-900">创建和管理项目</h4>
                                </div>
                                <ul className="text-sm text-gray-600 space-y-2 ml-4">
                                    <li>• 在项目管理页面点击"新建项目"创建分析项目</li>
                                    <li>• 设置清晰的项目标题和分析议题</li>
                                    <li>• 使用搜索功能快速找到特定项目</li>
                                    <li>• 查看项目卡片上的完成度和统计信息</li>
                                    <li>• 通过编辑功能修改项目信息</li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Badge className="bg-purple-100 text-purple-800">假设管理</Badge>
                                    <h4 className="font-semibold text-gray-900">添加和编辑假设</h4>
                                </div>
                                <ul className="text-sm text-gray-600 space-y-2 ml-4">
                                    <li>• 在步骤1中添加3-7个竞争性假设</li>
                                    <li>• 确保假设之间相互排斥且穷尽所有可能</li>
                                    <li>• 设置初始置信度（0-100%）</li>
                                    <li>• 分配优先级：高、中、低</li>
                                    <li>• 使用排序功能调整假设顺序</li>
                                    <li>• 点击编辑按钮修改假设内容</li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Badge className="bg-green-100 text-green-800">证据评估</Badge>
                                    <h4 className="font-semibold text-gray-900">收集和评估证据</h4>
                                </div>
                                <ul className="text-sm text-gray-600 space-y-2 ml-4">
                                    <li>• 在步骤2中添加支持或反对假设的证据</li>
                                    <li>• 选择证据类型：文档、数据、专家意见等</li>
                                    <li>• 设置证据权重（0-100%）表示重要性</li>
                                    <li>• 评估证据可靠性（0-100%）</li>
                                    <li>• 添加证据来源和备注信息</li>
                                    <li>• 使用多列布局提高空间利用效率</li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Badge className="bg-pink-100 text-pink-800">矩阵分析</Badge>
                                    <h4 className="font-semibold text-gray-900">构建评分矩阵</h4>
                                </div>
                                <ul className="text-sm text-gray-600 space-y-2 ml-4">
                                    <li>• 在步骤3中对每个假设-证据组合评分</li>
                                    <li>• 使用评分系统：-2(强反对)到+2(强支持)</li>
                                    <li>• 中性评分(0)表示证据对假设无明显影响</li>
                                    <li>• 关注证据的诊断价值而非简单支持</li>
                                    <li>• 查看实时假设排序和得分统计</li>
                                    <li>• 导出矩阵数据进行外部分析</li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Badge className="bg-orange-100 text-orange-800">矩阵优化</Badge>
                                    <h4 className="font-semibold text-gray-900">精简和优化</h4>
                                </div>
                                <ul className="text-sm text-gray-600 space-y-2 ml-4">
                                    <li>• 在步骤4中查看系统生成的优化建议</li>
                                    <li>• 移除低诊断价值的证据</li>
                                    <li>• 合并高度相似的假设</li>
                                    <li>• 补充缺失的矩阵评分</li>
                                    <li>• 分析证据价值和假设相似性</li>
                                    <li>• 应用建议提高分析质量</li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Badge className="bg-teal-100 text-teal-800">结论报告</Badge>
                                    <h4 className="font-semibold text-gray-900">生成分析报告</h4>
                                </div>
                                <ul className="text-sm text-gray-600 space-y-2 ml-4">
                                    <li>• 在步骤5中查看假设排序和置信度</li>
                                    <li>• 进行敏感性分析测试结论稳定性</li>
                                    <li>• 在步骤7中生成完整分析报告</li>
                                    <li>• 导出为PDF、Word或HTML格式</li>
                                    <li>• 设置里程碑监控后续变化</li>
                                    <li>• 包含分析过程和关键发现</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 快捷键指南 */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center space-x-2">
                        <Keyboard className="h-6 w-6 text-purple-600" />
                        <span>快捷键指南</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900">项目操作</h4>
                            <div className="space-y-2">
                                {[
                                    { key: 'Ctrl + N', desc: '新建项目' },
                                    { key: 'Ctrl + S', desc: '保存项目' },
                                    { key: 'Ctrl + E', desc: '导出数据' },
                                    { key: 'Ctrl + I', desc: '导入数据' }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">{item.desc}</span>
                                        <Badge variant="outline" className="font-mono">{item.key}</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900">导航操作</h4>
                            <div className="space-y-2">
                                {[
                                    { key: 'Ctrl + ←', desc: '上一步' },
                                    { key: 'Ctrl + →', desc: '下一步' },
                                    { key: 'Ctrl + H', desc: '返回首页' },
                                    { key: 'Ctrl + ?', desc: '打开帮助' }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">{item.desc}</span>
                                        <Badge variant="outline" className="font-mono">{item.key}</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900">编辑操作</h4>
                            <div className="space-y-2">
                                {[
                                    { key: 'Ctrl + F', desc: '搜索内容' },
                                    { key: 'Escape', desc: '取消编辑' },
                                    { key: 'Enter', desc: '确认添加' },
                                    { key: 'Ctrl + Z', desc: '撤销操作' }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">{item.desc}</span>
                                        <Badge variant="outline" className="font-mono">{item.key}</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 常见问题 */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center space-x-2">
                        <HelpCircle className="h-6 w-6 text-orange-600" />
                        <span>常见问题</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {[
                            {
                                q: '如何确定假设的数量？',
                                a: '假设数量应根据议题的复杂性和重要性确定。一般建议3-7个假设比较合适。过少可能遗漏重要可能性，过多会增加分析复杂度。确保假设之间相互排斥且穷尽所有合理可能性。'
                            },
                            {
                                q: '矩阵评分的标准是什么？',
                                a: '使用-2到+2的评分系统：-2表示强反对（证据强烈反驳假设），-1表示弱反对，0表示中性（证据对假设无明显影响），+1表示弱支持，+2表示强支持。重点关注证据的诊断价值，即能否区分不同假设。'
                            },
                            {
                                q: '如何处理缺失或不确定的证据？',
                                a: '对于缺失的证据，可以在矩阵中留空或标记为中性。不确定的证据可以通过降低可靠性权重来处理。在步骤4中使用精简功能移除低价值证据，在步骤6中进行敏感性分析测试缺失证据的影响。'
                            },
                            {
                                q: '如何解释分析结果？',
                                a: 'ACH分析的核心是比较假设的相对可能性，而非绝对概率。排名最高的假设未必是正确答案，需要关注假设间的得分差距。同时要考虑证据的完整性、可靠性和分析的局限性。'
                            },
                            {
                                q: '数据如何保存和导出？',
                                a: '系统自动将数据保存到浏览器本地存储，刷新页面后数据仍会保留。可以在各步骤中导出相应的分析结果，支持CSV、PDF等格式。建议定期备份重要分析项目。'
                            },
                            {
                                q: '如何进行团队协作分析？',
                                a: '可以导出项目数据与团队成员共享，或将分析报告发送给相关人员。未来版本将支持在线协作功能，允许多人同时编辑和评论分析内容。'
                            }
                        ].map((faq, index) => (
                            <div key={index} className="border-l-4 border-blue-200 pl-4">
                                <h4 className="font-semibold text-gray-900 mb-2">Q: {faq.q}</h4>
                                <p className="text-gray-600 leading-relaxed">A: {faq.a}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 最佳实践 */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center space-x-2">
                        <Lightbulb className="h-6 w-6 text-yellow-600" />
                        <span>最佳实践建议</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900">分析质量提升</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• 确保假设的互斥性和穷尽性</li>
                                <li>• 收集多样化和高质量的证据</li>
                                <li>• 重视证据的诊断价值而非支持程度</li>
                                <li>• 定期更新和验证证据的有效性</li>
                                <li>• 进行多轮迭代优化分析结果</li>
                                <li>• 邀请同事进行独立评估和交叉验证</li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900">常见陷阱避免</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• 避免确认偏见，平等对待所有假设</li>
                                <li>• 不要过度依赖单一类型的证据</li>
                                <li>• 警惕证据的时效性和背景依赖性</li>
                                <li>• 避免在证据不足时匆忙得出结论</li>
                                <li>• 不要忽视假设的基础概率</li>
                                <li>• 考虑分析的局限性和不确定性</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 技术支持 */}
            <Alert className="border-blue-200 bg-blue-50">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                    <div className="flex items-start justify-between">
                        <div>
                            <strong>需要更多帮助？</strong>
                            <p className="mt-2 text-sm">
                                如果您在使用过程中遇到问题或有改进建议，请通过以下方式联系我们：
                            </p>
                            <ul className="mt-2 text-sm space-y-1">
                                <li>• 邮箱：support@achanalysis.com</li>
                                <li>• 在线文档：docs.achanalysis.com</li>
                                <li>• 用户社区：community.achanalysis.com</li>
                            </ul>
                        </div>
                        <div className="text-right text-sm text-blue-600">
                            <p>版本 2.0.0</p>
                            <p>更新时间: 2024-01-15</p>
                        </div>
                    </div>
                </AlertDescription>
            </Alert>
        </div>
    );
}; 
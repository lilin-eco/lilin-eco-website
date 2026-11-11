export const company = {
  name: '礼林生态',
  fullName: '达州礼林生态科技有限责任公司',
  englishName: 'LILIN ECO',
  positioning: '面向政府的工程项目软件服务',
  phone: null as string | null,
  email: null as string | null,
  address: null as string | null,
};

export const solutions = [
  {
    id: 'project-information',
    number: '01',
    title: '项目信息管理',
    description: '围绕工程项目基础信息、阶段状态与业务资料，梳理统一的信息组织方式。',
    points: ['项目基础信息梳理', '业务状态与阶段跟踪', '关联资料分类归集'],
    scene: '适用于需要集中整理工程项目信息的业务场景。',
  },
  {
    id: 'process-collaboration',
    number: '02',
    title: '业务过程协同',
    description: '围绕参与角色、工作节点与信息流转，沟通符合实际管理要求的软件方案。',
    points: ['参与角色与职责梳理', '工作节点与流转关系', '过程记录与资料衔接'],
    scene: '适用于涉及多角色、多环节协作的工程项目业务。',
  },
  {
    id: 'data-overview',
    number: '03',
    title: '数据汇集与展示',
    description: '围绕项目进展、业务台账与统计口径，明确数据汇集和展示需求。',
    points: ['数据来源与统计口径', '业务台账与查询需求', '项目概览与信息展示'],
    scene: '适用于需要汇总了解项目信息与业务进展的管理场景。',
  },
];

export const serviceSteps = [
  ['01', '需求沟通', '明确业务目标、使用角色、现有流程与项目边界。'],
  ['02', '方案梳理', '围绕业务场景，沟通功能范围、数据关系与实施安排。'],
  ['03', '开发与联调', '依据确认的需求开展软件开发，并协调相关系统的联调工作。'],
  ['04', '上线与交付', '按项目约定组织测试、使用说明、上线及交付资料。'],
  ['05', '运行与支持', '依据服务约定沟通问题反馈、运行支持与后续优化。'],
];

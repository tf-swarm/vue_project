import Vue from 'vue'

import {
  Container,
  Header,
  Aside,
  Main,
  Row,
  Col,
  Icon,
  Card,
  Button,
  Select,
  Option,
  Input,
  Divider,
  Popover,
  Tooltip,
  Cascader,
  Collapse,
  CollapseItem,
  Table,
  TableColumn,
  Form,
  FormItem,
  Tag,
  Tabs,
  TabPane,
  DatePicker,
  Badge,
  Radio,
  RadioGroup,
  Checkbox,
  CheckboxGroup,
  Switch,
  Menu,
  MenuItem,
  Link,
  submenu,
  Breadcrumb,
  BreadcrumbItem,
  Dialog,
  Pagination,
  autocomplete,
  Loading,
  Message,
  MessageBox,
  Upload,
  Tree,
} from 'element-ui'

Vue.use(Container)
  .use(Header)
  .use(Aside)
  .use(Main)
  .use(Row)
  .use(Col)
  .use(Icon)
  .use(Card)
  .use(Button)
  .use(Select)
  .use(Option)
  .use(Input)
  .use(Divider)
  .use(Popover)
  .use(Tooltip)
  .use(Cascader)
  .use(Collapse)
  .use(CollapseItem)
  .use(Table)
  .use(TableColumn)
  .use(Form)
  .use(FormItem)
  .use(Tag)
  .use(Tabs)
  .use(TabPane)
  .use(DatePicker)
  .use(Badge)
  .use(Radio)
  .use(RadioGroup)
  .use(Checkbox)
  .use(CheckboxGroup)
  .use(Switch)
  .use(Menu)
  .use(MenuItem)
  .use(Link)
  .use(submenu)
  .use(Breadcrumb)
  .use(BreadcrumbItem)
  .use(Dialog)
  .use(Pagination)
  .use(autocomplete)
  .use(Loading.directive)
  .use(Upload)
  .use(Tree)

Vue.prototype.$message = Message
Vue.prototype.$alert = MessageBox.alert
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$loading = Loading.service

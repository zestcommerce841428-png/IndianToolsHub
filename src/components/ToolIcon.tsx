import React from 'react';
import SwapHoriz from '@mui/icons-material/SwapHoriz';
import Compress from '@mui/icons-material/Compress';
import AspectRatio from '@mui/icons-material/AspectRatio';
import Crop from '@mui/icons-material/Crop';
import Scanner from '@mui/icons-material/Scanner';
import RotateRight from '@mui/icons-material/RotateRight';
import PictureAsPdf from '@mui/icons-material/PictureAsPdf';
import FolderZip from '@mui/icons-material/FolderZip';
import CallMerge from '@mui/icons-material/CallMerge';
import Assignment from '@mui/icons-material/Assignment';
import Lock from '@mui/icons-material/Lock';
import Draw from '@mui/icons-material/Draw';
import Calculate from '@mui/icons-material/Calculate';
import Cake from '@mui/icons-material/Cake';
import MonitorWeight from '@mui/icons-material/MonitorWeight';
import Home from '@mui/icons-material/Home';
import Percent from '@mui/icons-material/Percent';
import MonetizationOn from '@mui/icons-material/MonetizationOn';
import TextFields from '@mui/icons-material/TextFields';
import Segment from '@mui/icons-material/Segment';
import FilterAlt from '@mui/icons-material/FilterAlt';
import SortByAlpha from '@mui/icons-material/SortByAlpha';
import Undo from '@mui/icons-material/Undo';
import LockOpen from '@mui/icons-material/LockOpen';
import Code from '@mui/icons-material/Code';
import LinkIcon from '@mui/icons-material/Link';
import Colorize from '@mui/icons-material/Colorize';
import Rule from '@mui/icons-material/Rule';
import Image from '@mui/icons-material/Image';
import Gradient from '@mui/icons-material/Gradient';
import Compare from '@mui/icons-material/Compare';
import SettingsInputAntenna from '@mui/icons-material/SettingsInputAntenna';
import Visibility from '@mui/icons-material/Visibility';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import LocalOffer from '@mui/icons-material/LocalOffer';
import FormatAlignLeft from '@mui/icons-material/FormatAlignLeft';
import QrCode from '@mui/icons-material/QrCode';
import CropFree from '@mui/icons-material/CropFree'; // Safe replacement for BarcodeReader
import Key from '@mui/icons-material/Key';
import Straighten from '@mui/icons-material/Straighten';
import Schedule from '@mui/icons-material/Schedule';
import Security from '@mui/icons-material/Security';
import TrendingUp from '@mui/icons-material/TrendingUp';
import Build from '@mui/icons-material/Build';
import Description from '@mui/icons-material/Description';

const iconMap: Record<string, React.ComponentType<{ sx?: any }>> = {
  SwapHoriz,
  Compress,
  AspectRatio,
  Crop,
  Scanner,
  RotateRight,
  PictureAsPdf,
  FolderZip,
  CallMerge,
  Assignment,
  Lock,
  Draw,
  Calculate,
  Cake,
  MonitorWeight,
  Home,
  Percent,
  MonetizationOn,
  TextFields,
  Segment,
  FilterAlt,
  SortByAlpha,
  Undo,
  LockOpen,
  Code,
  Link: LinkIcon,
  Colorize,
  Rule,
  Image,
  Gradient,
  Compare,
  SettingsInputAntenna,
  Visibility,
  AutoAwesome,
  LocalOffer,
  FormatAlignLeft,
  QrCode,
  BarcodeReader: CropFree,
  Key,
  Straighten,
  Schedule,
  Security,
  TrendingUp,
  Build,
  Description,
};

interface ToolIconProps {
  name: string;
  sx?: any;
}

export default function ToolIcon({ name, sx }: ToolIconProps) {
  const IconComponent = iconMap[name] || Build;
  return <IconComponent sx={sx} />;
}

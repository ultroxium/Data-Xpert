import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '../ui/button';
import { ArrowDownZA, ArrowDown01, ArrowDownAZ, ListStart, SortAsc } from 'lucide-react';
import { CustomTooltip } from '../common/custom-tooltip';

const SortBy = ({ handleSort }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={'outline'}>
          <CustomTooltip title="Sort">
            <ListStart size={16} />
          </CustomTooltip>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            handleSort('asc');
          }}>
          <ArrowDownAZ size={16} className="mr-2" />
          <span>Name Asc</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            handleSort('desc');
          }}>
          <ArrowDownZA size={16} className="mr-2" />
          <span>Name Desc</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            handleSort('created_at');
          }}>
          <ArrowDown01 size={16} className="mr-2" />
          <span>Created at</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            handleSort('updated_at');
          }}>
          <SortAsc size={16} className="mr-2" />
          <span>Updated at</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortBy;

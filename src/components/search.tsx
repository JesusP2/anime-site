import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SearchWithFilters() {
  return (
    <div className="w-full max-w-4xl p-4">
      <h1 className="text-2xl font-bold mb-4">Search</h1>
      <div className="flex flex-col space-y-4">
        <div className="flex space-x-2">
          <Input type="text" placeholder="Search..." className="flex-grow" />
          <Button type="submit">Search</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="books">Books</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="0-50">$0 - $50</SelectItem>
              <SelectItem value="50-100">$50 - $100</SelectItem>
              <SelectItem value="100+">$100+</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="4+">4+ Stars</SelectItem>
              <SelectItem value="3+">3+ Stars</SelectItem>
              <SelectItem value="2+">2+ Stars</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

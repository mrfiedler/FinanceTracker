<div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Revenue & Expense Trends</h2>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[100px] h-8 text-sm">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Monthly">Monthly</SelectItem>
            <SelectItem value="Quarterly">Quarterly</SelectItem>
            <SelectItem value="Yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
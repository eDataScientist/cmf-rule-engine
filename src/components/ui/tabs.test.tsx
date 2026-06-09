import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('TabsContent', () => {
  it('renders all tab contents but only shows the active one', () => {
    function TestTabs() {
      return (
        <Tabs value="tab1" onValueChange={() => {}}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <div data-testid="content1">Content 1</div>
          </TabsContent>
          <TabsContent value="tab2">
            <div data-testid="content2">Content 2</div>
          </TabsContent>
        </Tabs>
      );
    }

    render(<TestTabs />);

    // Both contents should be in the DOM
    expect(screen.getByTestId('content1')).toBeInTheDocument();
    expect(screen.getByTestId('content2')).toBeInTheDocument();

    // Active content should be visible, inactive should have hidden class
    expect(screen.getByTestId('content1')).toBeVisible();
    expect(screen.getByTestId('content1').parentElement).not.toHaveClass('hidden');
    expect(screen.getByTestId('content2').parentElement).toHaveClass('hidden');
  });

  it('preserves tab content state when switching tabs', async () => {
    const user = userEvent.setup();

    function TabWithState() {
      const [count, setCount] = useState(0);
      return (
        <div>
          <button onClick={() => setCount((c) => c + 1)} data-testid="increment">
            Increment
          </button>
          <span data-testid="count">{count}</span>
        </div>
      );
    }

    function TestTabs() {
      const [activeTab, setActiveTab] = useState('tab1');
      return (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <TabWithState />
          </TabsContent>
          <TabsContent value="tab2">
            <div data-testid="tab2-content">Tab 2 Content</div>
          </TabsContent>
        </Tabs>
      );
    }

    render(<TestTabs />);

    // Interact with tab 1
    await user.click(screen.getByTestId('increment'));
    expect(screen.getByTestId('count').textContent).toBe('1');

    // Switch to tab 2
    await user.click(screen.getByText('Tab 2'));
    expect(screen.getByTestId('tab2-content')).toBeVisible();

    // Switch back to tab 1
    await user.click(screen.getByText('Tab 1'));

    // State should be preserved
    expect(screen.getByTestId('count').textContent).toBe('1');
  });
});

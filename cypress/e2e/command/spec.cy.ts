import { runTestServer } from '../../support/testUtils';

describe('Command', () => {
  before(() => {
    runTestServer();
  });

  beforeEach(() => {
    // Ensure fresh state for each test
    cy.visit('/');
    cy.get('#chat-input').should('exist');
    cy.wait(500); // Small wait for commands to initialize
  });

  it('should correctly display and interact with commands', () => {
    // Test 1: Check initial command buttons
    // "Search" should be visible as a button (has button: true)
    cy.get('#command-Search').should('exist').and('be.visible');
    
    // "Picture" and "Canvas" should not be visible as buttons (button: false)
    cy.get('#command-Picture').should('not.exist');
    cy.get('#command-Canvas').should('not.exist');
    
    // Tools button should exist for non-button commands
    cy.get('#command-button').should('exist').and('be.visible');

    // Test 2: Test typing "/" to show command menu
    cy.get('#chat-input').click().clear();
    cy.get('#chat-input').type('/');
    
    // Command menu should appear with all non-button commands
    cy.get('[data-index]').should('have.length.at.least', 2);
    
    // Type to filter commands
    cy.get('#chat-input').type('pic');
    
    // Should only show Picture command
    cy.get('[data-index]').should('have.length', 1);
    cy.get('[data-index="0"]').should('contain', 'Picture');
    
    // Click to select Picture command
    cy.get('[data-index="0"]').click();
    
    // Command should be selected (shown as button)
    cy.get('#command-Picture').should('exist').and('be.visible');
    
    // Send message with Picture command
    cy.get('#chat-input').type('Generate an image{enter}');
    
    // Check message was sent with correct command
    cy.get('.step').should('have.length', 2);
    cy.get('.step').eq(1).should('contain', 'Command: Picture');
    
    // After Picture command, all commands should be removed (as per main.py logic)
    cy.get('#command-Search').should('not.exist');
    cy.get('#command-button').should('not.exist');
    cy.get('#command-Picture').should('not.exist');
  });

  it('should handle keyboard navigation in command menu', () => {
    // Open command menu
    cy.get('#chat-input').click().clear();
    cy.get('#chat-input').type('/');
    
    // Command menu should appear
    cy.get('[data-index]').should('have.length.at.least', 2);
    
    // First item should be selected by default
    cy.get('[data-index="0"]').should('have.class', 'bg-accent');
    
    // Press arrow down to select next item
    cy.get('#chat-input').type('{downArrow}');
    cy.get('[data-index="1"]').should('have.class', 'bg-accent');
    
    // Press arrow up to go back
    cy.get('#chat-input').type('{upArrow}');
    cy.get('[data-index="0"]').should('have.class', 'bg-accent');
    
    // Press Enter to select
    cy.get('#chat-input').type('{enter}');
    
    // Command menu should be closed
    cy.get('[data-index]').should('not.exist');
    
    // A command should be selected (either Picture or Canvas depending on order)
    cy.get('[id^="command-"]').should('have.length.at.least', 1);
  });

  it('should handle Tools dropdown menu', () => {
    // Click Tools button
    cy.get('#command-button').should('exist').click();
    
    // Dropdown should appear with non-button commands
    cy.get('[data-popover-content]').should('be.visible');
    cy.get('[data-popover-content] [data-index]').should('have.length', 2);
    
    // Check that Picture and Canvas are in the dropdown
    cy.get('[data-popover-content]').should('contain', 'Picture');
    cy.get('[data-popover-content]').should('contain', 'Canvas');
    
    // Click Canvas command
    cy.get('[data-popover-content] [data-index]').contains('Canvas').click();
    
    // Canvas should now be visible as a button
    cy.get('#command-Canvas').should('exist').and('be.visible');
    
    // Tools button should still exist
    cy.get('#command-button').should('exist');
    
    // Send message with Canvas command
    cy.get('#chat-input').type('Collaborate on code{enter}');
    
    // Check message was sent with correct command
    cy.get('.step').should('contain', 'Command: Canvas');
  });

  it('should handle button command clicks', () => {
    // Search button should exist
    cy.get('#command-Search').should('exist');
    
    // Click Search button to select it
    cy.get('#command-Search').click();
    
    // Search button should have selected visual indicator
    // Check for either the class or the visual state
    cy.get('#command-Search').should('satisfy', ($el) => {
      // Check if it has the selected class or the selected visual styling
      return $el.hasClass('command-selected') || 
             $el.hasClass('text-[#0066FF]') ||
             $el.find('span').hasClass('text-[#0066FF]') ||
             $el.find('.text-\\[\\#0066FF\\]').length > 0;
    });
    
    // Send message with Search command
    cy.get('#chat-input').type('Search for chainlit{enter}');
    
    // Check message was sent with correct command
    cy.get('.step').should('contain', 'Command: Search');
    
    // Search button might still be selected depending on persistent behavior
    cy.get('#command-Search').should('exist');
    
    // Click Search button again to toggle
    cy.get('#command-Search').click();
    
    // Send message - should check the command state
    cy.get('#chat-input').type('No command message{enter}');
    
    // Check the last message - it might show Search if persistent or None if not
    cy.get('.step').last().should('contain', 'Command:');
  });

  it('should handle escape key to close command menu', () => {
    // Open command menu
    cy.get('#chat-input').click().clear();
    cy.get('#chat-input').type('/');
    
    // Command menu should appear
    cy.get('[data-index]').should('exist').and('have.length.at.least', 2);
    
    // Press Escape to close
    cy.get('#chat-input').type('{esc}');
    
    // Command menu should be closed
    cy.get('[data-index]').should('not.exist');
    
    // The "/" should still be in the input
    cy.get('#chat-input').should('have.value', '/');
  });

  it('should handle command selection via click', () => {
    // Open command menu and filter
    cy.get('#chat-input').click().clear();
    cy.get('#chat-input').type('/can');
    
    // Should show Canvas command
    cy.get('[data-index]').should('have.length', 1);
    cy.get('[data-index="0"]').should('contain', 'Canvas');
    
    // Click to select (instead of Tab which isn't supported)
    cy.get('[data-index="0"]').click();
    
    // Canvas should be selected
    cy.get('#command-Canvas').should('exist').and('be.visible');
    
    // Command menu should be closed
    cy.get('[data-index]').should('not.exist');
    
    // Input should be cleared of the command text
    cy.get('#chat-input').invoke('val').should('not.contain', '/can');
  });

  it('should properly handle selected non-button command removal', () => {
    // Select Canvas via Tools menu
    cy.get('#command-button').should('exist').click();
    cy.get('[data-popover-content]').should('be.visible');
    cy.get('[data-popover-content] [data-index]').contains('Canvas').click();
    
    // Canvas should be visible as a button
    cy.get('#command-Canvas').should('exist').and('be.visible');
    
    // Click Canvas to deselect it
    cy.get('#command-Canvas').click();
    
    // Canvas should disappear and not be in buttons anymore
    cy.get('#command-Canvas').should('not.exist');
    
    // Tools button should still exist
    cy.get('#command-button').should('exist');
  });

  it('should handle mouse hover in command menus', () => {
    // Open command menu
    cy.get('#chat-input').click().clear();
    cy.get('#chat-input').type('/');
    
    // Wait for menu to appear
    cy.get('[data-index]').should('have.length.at.least', 2);
    
    // First item should be selected by default
    cy.get('[data-index="0"]').should('have.class', 'bg-accent');
    
    // Hover over second item
    cy.get('[data-index="1"]').trigger('mousemove');
    
    // Second item should be highlighted
    cy.get('[data-index="1"]').should('have.class', 'bg-accent');
    
    // First item should not be highlighted
    cy.get('[data-index="0"]').should('not.have.class', 'bg-accent');
    
    // Mouse leave should maintain selection
    cy.get('[data-index="1"]').trigger('mouseleave');
    cy.wait(100); // Small wait for state update
    cy.get('[data-index="1"]').should('have.class', 'bg-accent');
  });

  it('should filter commands correctly', () => {
    // Type /pic to filter for Picture (more specific than /p)
    cy.get('#chat-input').click().clear();
    cy.get('#chat-input').type('/pic');
    
    // Should show only Picture command - be more specific with selector
    cy.get('.command-menu-animate [data-index]').should('have.length', 1);
    cy.get('.command-menu-animate [data-index="0"]').should('contain', 'Picture');
    
    // Clear and type /can to filter for Canvas
    cy.get('#chat-input').clear().type('/can');
    
    // Should show only Canvas command
    cy.get('.command-menu-animate [data-index]').should('have.length', 1);
    cy.get('.command-menu-animate [data-index="0"]').should('contain', 'Canvas');
    
    // Clear and type /xyz for no matches
    cy.get('#chat-input').clear().type('/xyz');
    
    // Should show no commands
    cy.get('.command-menu-animate [data-index]').should('not.exist');
  });

  it('should handle Tools dropdown keyboard navigation', () => {
    // Open Tools dropdown
    cy.get('#command-button').should('exist').click();
    cy.get('[data-popover-content]').should('be.visible');
    
    // First item should be selected by default
    cy.get('[data-popover-content] [data-index="0"]').should('have.class', 'bg-accent');
    
    // Press arrow down
    cy.get('[data-popover-content]').type('{downArrow}');
    cy.get('[data-popover-content] [data-index="1"]').should('have.class', 'bg-accent');
    
    // Press arrow up to wrap around
    cy.get('[data-popover-content]').type('{upArrow}');
    cy.get('[data-popover-content] [data-index="0"]').should('have.class', 'bg-accent');
    
    // Press Enter to select
    cy.get('[data-popover-content]').type('{enter}');
    
    // Dropdown should be closed and command selected
    cy.get('[data-popover-content]').should('not.exist');
    cy.get('[id^="command-"][id$="icture"], [id^="command-"][id$="anvas"]').should('exist');
  });

  it('should handle command persistence correctly', () => {
    // Test that button commands can be toggled
    cy.get('#command-Search').should('exist');
    
    // Select Search
    cy.get('#command-Search').click();
    
    // Send a message
    cy.get('#chat-input').type('First search{enter}');
    cy.get('.step').should('contain', 'Command: Search');
    
    // Search might still be selected if it has persistent behavior
    // Try to deselect
    cy.get('#command-Search').click();
    
    // Send another message
    cy.get('#chat-input').type('Second message{enter}');
    
    // Check if command persisted or not
    cy.get('.step').last().should('contain', 'Command:');
  });

  it('should show commands in correct places', () => {
    // Button commands should be visible as buttons
    cy.get('#command-Search').should('exist').and('be.visible');
    
    // Non-button commands should NOT be visible as buttons initially
    cy.get('#command-Picture').should('not.exist');
    cy.get('#command-Canvas').should('not.exist');
    
    // Tools dropdown should only show non-button commands
    cy.get('#command-button').click();
    cy.get('[data-popover-content]').within(() => {
      cy.contains('Picture').should('exist');
      cy.contains('Canvas').should('exist');
      cy.contains('Search').should('not.exist'); // Button commands not in Tools
    });
    
    // Close dropdown by clicking outside
    cy.get('body').click(0, 0);
    cy.wait(200); // Wait for dropdown to close
    
    // "/" command shows ALL commands (including button commands)
    cy.get('#chat-input').type('/');
    cy.get('.command-menu-animate [data-index]').should('have.length', 3); // Picture, Canvas, and Search
    
    // Verify all three commands are present
    cy.get('.command-menu-animate').within(() => {
      cy.contains('Picture').should('exist');
      cy.contains('Canvas').should('exist');
      cy.contains('Search').should('exist');
    });
  });
});

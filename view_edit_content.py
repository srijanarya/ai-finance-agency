#!/usr/bin/env python3
"""
View and Edit Pending Content
Interactive tool to review and modify content before posting
"""

import sqlite3
import json
from datetime import datetime
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.prompt import Prompt, Confirm
from rich import print as rprint

console = Console()

class ContentEditor:
    def __init__(self):
        self.db_path = "data/agency.db"
    
    def get_pending_content(self):
        """Fetch all pending content ideas from database"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM content_ideas 
            WHERE status = 'pending'
            ORDER BY urgency DESC, estimated_reach DESC
            LIMIT 10
        ''')
        
        ideas = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return ideas
    
    def display_content_table(self, ideas):
        """Display content in a formatted table"""
        table = Table(title="📝 Pending Content Ideas", show_header=True, header_style="bold magenta")
        table.add_column("ID", style="cyan", width=6)
        table.add_column("Title", style="green", width=50)
        table.add_column("Type", style="yellow", width=15)
        table.add_column("Urgency", style="red", width=10)
        table.add_column("Reach", style="blue", width=10)
        table.add_column("Score", style="magenta", width=8)
        
        for idea in ideas:
            table.add_row(
                str(idea['id']),
                idea['title'][:50] + "..." if len(idea['title']) > 50 else idea['title'],
                idea['content_type'],
                idea['urgency'],
                str(idea['estimated_reach']),
                str(idea.get('relevance_score', 'N/A'))
            )
        
        console.print(table)
    
    def display_full_content(self, idea):
        """Display full content details"""
        console.print("\n" + "="*80)
        rprint(Panel(f"[bold cyan]📌 {idea['title']}[/bold cyan]"))
        
        console.print(f"\n[bold]Type:[/bold] {idea['content_type']}")
        console.print(f"[bold]Urgency:[/bold] {idea['urgency']}")
        console.print(f"[bold]Target Audience:[/bold] {idea['target_audience']}")
        console.print(f"[bold]Estimated Reach:[/bold] {idea['estimated_reach']:,}")
        console.print(f"[bold]Relevance Score:[/bold] {idea.get('relevance_score', 'N/A')}")
        
        if idea.get('keywords'):
            keywords = json.loads(idea['keywords'])
            console.print(f"\n[bold]Keywords:[/bold] {', '.join(keywords)}")
        
        if idea.get('data_points'):
            data = json.loads(idea['data_points'])
            console.print(f"\n[bold]Data Points:[/bold]")
            for key, value in data.items():
                console.print(f"  • {key}: {value}")
        
        console.print("\n" + "="*80)
    
    def edit_content(self, idea):
        """Edit content idea fields"""
        console.print("\n[bold yellow]📝 Edit Content[/bold yellow]")
        console.print("Press Enter to keep current value\n")
        
        # Edit title
        new_title = Prompt.ask(f"Title [{idea['title'][:50]}...]", default=idea['title'])
        
        # Edit urgency
        urgency_options = ['critical', 'high', 'medium', 'low']
        console.print(f"Urgency options: {', '.join(urgency_options)}")
        new_urgency = Prompt.ask(f"Urgency [{idea['urgency']}]", default=idea['urgency'])
        
        # Edit target audience
        audience_options = ['general_investors', 'active_traders', 'beginners', 'professionals', 'institutions']
        console.print(f"Audience options: {', '.join(audience_options)}")
        new_audience = Prompt.ask(f"Target Audience [{idea['target_audience']}]", default=idea['target_audience'])
        
        # Edit estimated reach
        new_reach = Prompt.ask(f"Estimated Reach [{idea['estimated_reach']}]", default=str(idea['estimated_reach']))
        
        # Edit keywords
        if idea.get('keywords'):
            current_keywords = json.loads(idea['keywords'])
            console.print(f"Current keywords: {', '.join(current_keywords)}")
            new_keywords_str = Prompt.ask("Keywords (comma-separated)", default=', '.join(current_keywords))
            new_keywords = [k.strip() for k in new_keywords_str.split(',')]
        else:
            new_keywords_str = Prompt.ask("Keywords (comma-separated)", default="")
            new_keywords = [k.strip() for k in new_keywords_str.split(',') if k.strip()]
        
        # Confirm changes
        if Confirm.ask("\n💾 Save changes?"):
            self.update_content(
                idea['id'],
                new_title,
                new_urgency,
                new_audience,
                int(new_reach),
                new_keywords
            )
            console.print("[green]✅ Content updated successfully![/green]")
        else:
            console.print("[red]❌ Changes discarded[/red]")
    
    def update_content(self, content_id, title, urgency, audience, reach, keywords):
        """Update content in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE content_ideas 
            SET title = ?, urgency = ?, target_audience = ?, 
                estimated_reach = ?, keywords = ?
            WHERE id = ?
        ''', (title, urgency, audience, reach, json.dumps(keywords), content_id))
        
        conn.commit()
        conn.close()
    
    def mark_as_published(self, content_id):
        """Mark content as published"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE content_ideas 
            SET status = 'published', published_at = ?
            WHERE id = ?
        ''', (datetime.now().isoformat(), content_id))
        
        conn.commit()
        conn.close()
        console.print("[green]✅ Content marked as published![/green]")
    
    def delete_content(self, content_id):
        """Delete content idea"""
        if Confirm.ask("⚠️  Are you sure you want to delete this content?"):
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('DELETE FROM content_ideas WHERE id = ?', (content_id,))
            conn.commit()
            conn.close()
            console.print("[red]🗑️  Content deleted[/red]")
    
    def run(self):
        """Main interactive loop"""
        while True:
            console.clear()
            rprint("[bold cyan]🤖 AI Finance Agency - Content Manager[/bold cyan]\n")
            
            ideas = self.get_pending_content()
            
            if not ideas:
                console.print("[yellow]No pending content ideas found.[/yellow]")
                console.print("Run [cyan]python generate_content.py[/cyan] to create new content.")
                break
            
            self.display_content_table(ideas)
            
            console.print("\n[bold]Options:[/bold]")
            console.print("  [cyan]1-10[/cyan]: View/Edit content by ID")
            console.print("  [cyan]r[/cyan]: Refresh list")
            console.print("  [cyan]g[/cyan]: Generate new content")
            console.print("  [cyan]q[/cyan]: Quit")
            
            choice = Prompt.ask("\nEnter your choice").lower()
            
            if choice == 'q':
                break
            elif choice == 'r':
                continue
            elif choice == 'g':
                import os
                os.system('python generate_content.py')
                input("\nPress Enter to continue...")
            elif choice.isdigit():
                content_id = int(choice)
                # Find the idea with this ID
                idea = next((i for i in ideas if i['id'] == content_id), None)
                
                if idea:
                    self.display_full_content(idea)
                    
                    console.print("\n[bold]Actions:[/bold]")
                    console.print("  [cyan]e[/cyan]: Edit content")
                    console.print("  [cyan]p[/cyan]: Mark as published")
                    console.print("  [cyan]d[/cyan]: Delete content")
                    console.print("  [cyan]b[/cyan]: Back to list")
                    
                    action = Prompt.ask("Choose action").lower()
                    
                    if action == 'e':
                        self.edit_content(idea)
                        input("\nPress Enter to continue...")
                    elif action == 'p':
                        self.mark_as_published(content_id)
                        input("\nPress Enter to continue...")
                    elif action == 'd':
                        self.delete_content(content_id)
                        input("\nPress Enter to continue...")
                else:
                    console.print("[red]Content ID not found[/red]")
                    input("\nPress Enter to continue...")

def main():
    try:
        editor = ContentEditor()
        editor.run()
    except KeyboardInterrupt:
        console.print("\n[yellow]Exiting...[/yellow]")
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")

if __name__ == "__main__":
    main()
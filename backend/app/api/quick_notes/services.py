from datetime import datetime
from sqlalchemy.orm import Session
from app.api.quick_notes.model import QuickNote
from app.api.quick_notes.response import AddQuickNotes

class Services:
    def __init__(self, db: Session, current_user: dict):
        self.db = db
        self.current_user = current_user

    def get_quick_notes(self, workspace_id: int, dataset_id: int):
        notes = self.db.query(QuickNote).filter_by(workspace_id=workspace_id, dataset_id=dataset_id).all()
        return notes
    
    def create_quick_notes(self, workspace_id: int, dataset_id: int, notes: AddQuickNotes):
        
        new_note = QuickNote(
            content=notes.content,
            created_by=self.current_user.id,
            workspace_id=workspace_id,
            dataset_id=dataset_id
            )

        self.db.add(new_note)
        self.db.commit()
        self.db.refresh(new_note)
        return new_note
    
    def update_quick_notes(self, workspace_id: int, dataset_id: int,note_id:int, notes: AddQuickNotes):
        note = self.db.query(QuickNote).filter(QuickNote.id == note_id, QuickNote.dataset_id==dataset_id).first()
        note.content = notes.content
        note.updated_by = self.current_user.id
        note.updated_at = datetime.now()
        self.db.commit()
        self.db.refresh(note)
        return note
    
    def delete_quick_notes(self, workspace_id: int, dataset_id: int,note_id:int):
        note = self.db.query(QuickNote).filter(QuickNote.id == note_id, QuickNote.dataset_id==dataset_id).first()
        self.db.delete(note)
        self.db.commit()
        return {"message": "Note deleted successfully"}

    
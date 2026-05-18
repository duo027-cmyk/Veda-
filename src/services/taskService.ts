import { db, type Task } from '../lib/db';
import { auth, db as firestore, handleFirestoreError, OperationType, isFirestoreQuotaExceeded } from '../lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from 'firebase/firestore';

export const taskService = {
  async getAllTasks(): Promise<Task[]> {
    return await db.tasks.toArray();
  },

  async addTask(title: string, time: string, description?: string, tags?: string[]): Promise<string> {
    const id = `TASK_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const newTask: Task = {
      id,
      title,
      description,
      completed: false,
      time,
      tags: tags || [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // Persist to Dexie (Offline First)
    await db.tasks.add(newTask);
    
    // Sync to Firestore (Global Persistence)
    const user = auth.currentUser;
    if (user && !isFirestoreQuotaExceeded()) {
      try {
        const userRef = doc(firestore, 'users', user.uid);
        await updateDoc(userRef, {
          reminders: arrayUnion({
            id: newTask.id,
            task: newTask.title,
            time: newTask.time,
            completed: newTask.completed,
            tags: newTask.tags
          }),
          updatedAt: new Date().toISOString()
        }).catch(async (err) => {
          if (err.code === 'not-found') {
            // Document might not exist if user just joined
            await setDoc(userRef, {
              uid: user.uid,
              reminders: [{
                id: newTask.id,
                task: newTask.title,
                time: newTask.time,
                completed: newTask.completed,
                tags: newTask.tags
              }],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }, { merge: true });
          } else {
            throw err;
          }
        });
      } catch (err) {
        console.warn("[TASK_SERVICE] Firestore sync failed:", err);
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/reminders`);
      }
    }
    
    return id;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    const existing = await db.tasks.get(id);
    if (!existing) return;

    await db.tasks.update(id, {
      ...updates,
      updatedAt: Date.now()
    });

    // Sync to Firestore
    const user = auth.currentUser;
    if (user && !isFirestoreQuotaExceeded()) {
      try {
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const reminders = userDoc.data().reminders || [];
          const updatedReminders = reminders.map((r: any) => 
            r.id === id ? { 
              ...r, 
              task: updates.title || r.task, 
              completed: updates.completed !== undefined ? updates.completed : r.completed, 
              time: updates.time || r.time,
              tags: updates.tags || r.tags
            } : r
          );
          await updateDoc(userRef, {
            reminders: updatedReminders,
            updatedAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error("[TASK_SERVICE] Firestore update failed:", err);
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/reminders`);
      }
    }
  },

  async deleteTask(id: string): Promise<void> {
    const existing = await db.tasks.get(id);
    if (!existing) return;

    await db.tasks.delete(id);

    // Sync to Firestore
    const user = auth.currentUser;
    if (user && !isFirestoreQuotaExceeded()) {
      try {
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const reminders = userDoc.data().reminders || [];
          const filtered = reminders.filter((r: any) => r.id !== id);
          await updateDoc(userRef, {
            reminders: filtered,
            updatedAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error("[TASK_SERVICE] Firestore delete failed:", err);
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/reminders`);
      }
    }
  },

  async toggleTask(id: string): Promise<void> {
    const task = await db.tasks.get(id);
    if (task) {
      await this.updateTask(id, { completed: !task.completed });
    }
  },

  async syncFromFirestore(): Promise<void> {
    const user = auth.currentUser;
    if (!user || isFirestoreQuotaExceeded()) return;

    try {
      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      if (userDoc.exists()) {
        const reminders = userDoc.data().reminders || [];
        const lastSync = userDoc.data().updatedAt ? new Date(userDoc.data().updatedAt).getTime() : 0;
        
        for (const r of reminders) {
          const local = await db.tasks.get(r.id);
          if (!local) {
            await db.tasks.add({
              id: r.id,
              title: r.task,
              completed: r.completed,
              time: r.time,
              tags: r.tags || [],
              createdAt: Date.now(),
              updatedAt: Date.now()
            });
          } else if (local.updatedAt < lastSync) {
            await db.tasks.update(r.id, {
              title: r.task,
              completed: r.completed,
              time: r.time,
              tags: r.tags || [],
              updatedAt: Date.now()
            });
          }
        }
      }
    } catch (err) {
      console.error("[TASK_SERVICE] Sync from Firestore failed:", err);
      handleFirestoreError(err, OperationType.GET, `users/${user.uid}/reminders`);
    }
  }
};

---
title: "TIL：git worktree 讓我不再 stash"
date: 2026-08-26
tag: build
minutes: 2
sample: true
---

同事丟來一個 hotfix，我手上的功能改到一半。以前的流程是 stash、切分支、修完再 pop，然後花十分鐘想剛剛那包東西到底改到哪。worktree 讓兩個分支同時存在於磁碟上的兩個資料夾，什麼都不用收。

## worktree 怎麼用

```bash
# 在 ../hotfix 開一份 hotfix 分支的工作區
git worktree add ../hotfix -b hotfix/login-500

# 修完，刪掉工作區，分支還在
git worktree remove ../hotfix
```

## 我的 alias

每次都打完整指令太長，我把它縮成 `gwt`，順便讓資料夾名字自動跟著分支名走。

```bash
gwt() {
  git worktree add "../$(basename $PWD)-$1" -b "$1"
}
```

## 什麼時候還是用 stash

唯一還會用 stash 的場合：改動小到不值得開一個資料夾，例如只想跑一次 build 看看。

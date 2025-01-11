USE [TaskDb]
GO
CREATE TYPE [dbo].[ImageTableType] AS TABLE(
	[ImageFilePath] [nvarchar](255) NOT NULL,
	[FileName] [nvarchar](255) NOT NULL
)
GO
CREATE TYPE [dbo].[tblProductImages] AS TABLE(
	[ImageFilePath] [nvarchar](255) NULL,
	[FileName] [nvarchar](255) NULL
)
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tblCategory](
	[CategoryID] [int] IDENTITY(1,1) NOT NULL,
	[Name] [varchar](255) NOT NULL,
	[Description] [text] NULL,
	[IsActive] [int] NOT NULL,
	[ParentCategoryID] [int] NULL,
	[Path] [varchar](200) NULL,
	[CategoryLevel] [int] NULL,
	[Icon] [nvarchar](max) NULL,
	[CreatedDate] [datetime] NULL,
 CONSTRAINT [PK__tblCateg__19093A2B5006D21B] PRIMARY KEY CLUSTERED 
(
	[CategoryID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tblImages](
	[ImageId] [int] IDENTITY(1,1) NOT NULL,
	[ImagePath] [varchar](99) NULL,
	[Product_ID] [int] NULL,
	[IsActive] [bit] NULL,
	[CreatedBy] [int] NULL,
	[DreatedDate] [datetime] NULL,
	[FileName] [nvarchar](200) NULL,
 CONSTRAINT [PK_tblImages] PRIMARY KEY CLUSTERED 
(
	[ImageId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tblProduct](
	[ProductID] [int] IDENTITY(1,1) NOT NULL,
	[ProductName] [varchar](50) NULL,
	[Price] [decimal](18, 0) NULL,
	[StockQuantity] [int] NULL,
	[SKU] [varchar](50) NULL,
	[IsActive] [bit] NULL,
	[CreatedBy] [int] NULL,
	[CreatedDate] [datetime] NULL,
	[Category_ID] [int] NULL,
 CONSTRAINT [PK_tblProduct] PRIMARY KEY CLUSTERED 
(
	[ProductID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[tblCategory] ADD  CONSTRAINT [DF__tblCatego__IsAct__3C69FB99]  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[tblCategory] ADD  CONSTRAINT [DF__tblCatego__Updat__3E52440B]  DEFAULT (getdate()) FOR [CreatedDate]
GO
ALTER TABLE [dbo].[tblCategory]  WITH CHECK ADD  CONSTRAINT [FK_Category_Parent] FOREIGN KEY([ParentCategoryID])
REFERENCES [dbo].[tblCategory] ([CategoryID])
GO
ALTER TABLE [dbo].[tblCategory] CHECK CONSTRAINT [FK_Category_Parent]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Sp_CreateCategory]
    @ParentCategoryID INT = NULL,      
    @Title VARCHAR(255),               
    @Description TEXT = NULL,          
    @IsActive BIT = 1,
	@Icon Nvarchar(max)
AS
BEGIN
    DECLARE @CategoryLevel INT;

    IF @ParentCategoryID IS NOT NULL
    BEGIN
        SELECT @CategoryLevel = CategoryLevel
        FROM [tblCategory]
        WHERE CategoryID = @ParentCategoryID;
        SET @CategoryLevel = @CategoryLevel + 1;
    END
    ELSE
    BEGIN
        SET @CategoryLevel = 0; 
    END

    INSERT INTO [tblCategory](ParentCategoryID, Name, Description, IsActive, CategoryLevel,Icon,[Path], CreatedDate)
    VALUES (NULL, @Title, @Description, @IsActive, @CategoryLevel,@Icon,@Title, GETDATE());

    SELECT SCOPE_IDENTITY() AS CategoryID;
END;
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[Sp_CreateProduct]
(
    @ProductName NVARCHAR(100),
    @Price DECIMAL(18, 2),
    @StockQuantity INT,
    @SKU NVARCHAR(50),
    @IsActive BIT,
    @CategoryID INT,

   @Images dbo.tblProductImages READONLY
)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO tblProduct
    (   
	    ProductName,
        Price,
        StockQuantity,
        SKU,
        IsActive,
        CreatedDate,
        Category_ID
    )
    VALUES
    (
        @ProductName,
        @Price,
        @StockQuantity,
        @SKU,
        @IsActive,
        GETDATE(),
        @CategoryID
    );

    DECLARE @NewProductID INT = SCOPE_IDENTITY(); -- Get the last inserted ProductID

	IF Exists(Select Top 1 * FROM [dbo].[tblImages])
	BEGIN
    INSERT INTO [dbo].[tblImages]
    (
		 Product_ID,
         ImagePath,
		 IsActive,
		 DreatedDate,
		 FileName
    )
    SELECT 
		@NewProductID,
        t.ImageFilePath,
		1,
		GetDate(),
		t.FileName
    FROM @Images t;
	
	END
	SELECT  @NewProductID
END



GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Sp_CreateSubCategory]
(
    @Name NVARCHAR(100),
    @Description NVARCHAR(500),
    @IsActive BIT,
    @ParentCategoryID INT = NULL,  
	@Icon Nvarchar(max)=NULL,
    @CategoryLevel INT = 1        
)
AS
BEGIN
    SET NOCOUNT ON;
    
	Declare @Path Nvarchar(max)

    IF @ParentCategoryID IS NOT NULL
    BEGIN
        DECLARE @ParentCategoryLevel INT;
        SELECT @ParentCategoryLevel = CategoryLevel 
        FROM tblCategory
        WHERE CategoryID = @ParentCategoryID;

        SET @CategoryLevel = ISNULL(@ParentCategoryLevel,0) + 1;
        SELECT @Path = CONCAT((SELECT Path FROM tblCategory WHERE CategoryID = @ParentCategoryID), '>>', @Name);
    END

    INSERT INTO tblCategory (Name, Description, IsActive, ParentCategoryID, Path, CategoryLevel,Icon)
    VALUES (@Name, @Description, @IsActive, @ParentCategoryID, @Path, @CategoryLevel,@Icon);
    
    SELECT SCOPE_IDENTITY() AS CategoryID;
END


GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE Procedure [dbo].[Sp_DeleteCategory]
(
@CatgoryID INT
)
AS BEGIN
Update tblCategory SET IsActive=0 Where CategoryID=@CatgoryID
Select 1 as Success

END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE Procedure [dbo].[Sp_DeleteProduct]
(
@ProductID INT
)
AS BEGIN
Update tblProduct SET IsActive=0 Where ProductID=@ProductID
Select 1 as Success

END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE Procedure [dbo].[Sp_DeleteProductImage]
(
@ImageId INT
)
AS BEGIN


Update tblImages SET IsActive=0 Where ImageId=@ImageId
Select ImagePath from tblImages Where ImageId=@ImageId

END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[Sp_EditProduct]
(
    @ProductID INT,
    @ProductName NVARCHAR(100),
    @Price DECIMAL(18, 2),
    @StockQuantity INT,
    @SKU NVARCHAR(50),
    @IsActive BIT,
    @CategoryID INT,
    @Images dbo.tblProductImages READONLY
)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE tblProduct
    SET
        ProductName = @ProductName,
        Price = @Price,
        StockQuantity = @StockQuantity,
        SKU = @SKU,
        IsActive = @IsActive,
        Category_ID = @CategoryID,
        CreatedDate = GETDATE() 
    WHERE ProductID = @ProductID;

    --DELETE FROM tblImages WHERE Product_ID = @ProductID;

    INSERT INTO [dbo].[tblImages]
    (
        Product_ID,
        ImagePath,
        IsActive,
        DreatedDate,
        FileName
    )
    SELECT 
        @ProductID, 
        t.ImageFilePath,
        1, 
        GETDATE(),
        t.FileName
    FROM @Images t;

    SELECT @ProductID AS UpdatedProductID;

END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Sp_GetCategoryById]
(
@CategoryID INT
)
AS
BEGIN
   SET NOCOUNT ON;
    SELECT 
         CategoryID,
        [Name] AS Title,
        [Description],
        ISNULL([Icon], '') AS Icon,
        [IsActive]
    FROM [dbo].[tblCategory]
    WHERE [CategoryId] = @CategoryID
END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_GetCategoryList]
(
    @PageNumber INT = 0,  
    @PageSize INT = 10,
    @Search NVARCHAR(20) = NULL,
	@IsActive INT=null,
	@SortColumn Nvarchar(20)='title',
	@SortOrder Nvarchar(5)='asc'
)
AS
BEGIN
	 
	 SELECT
	 ROW_NUMBER() OVER (
         ORDER BY 
		CASE WHEN @SortColumn = 'isActive'      AND @SortOrder ='asc'  THEN IsActive    END ASC,
		CASE WHEN @SortColumn = 'isActive'      AND @SortOrder ='desc' THEN IsActive    END DESC,
		CASE WHEN @SortColumn = 'title'         AND @SortOrder ='asc'  THEN Name END ASC,
		CASE WHEN @SortColumn = 'title'		    AND @SortOrder ='desc' THEN Name END DESC
        ) AS SrNo,
	    [CategoryId],
        [Name] AS Title,
        CAST([Description] AS NVARCHAR(MAX)) AS Description, -- Convert text to NVARCHAR(MAX)
        [Icon],
        [CreatedDate],
        [IsActive],
        COUNT(*) OVER () AS TotalRecord
    FROM 
        tblCategory
    WHERE 
        (@Search IS NULL OR [Name] LIKE '%' + @Search + '%')
        AND(@IsActive IS NULL OR IsActive=@IsActive)
		ORDER BY 

		CASE WHEN @SortColumn = 'isActive'      AND @SortOrder ='asc'  THEN IsActive    END ASC,
		CASE WHEN @SortColumn = 'isActive'      AND @SortOrder ='desc' THEN IsActive    END DESC,
		CASE WHEN @SortColumn = 'title'         AND @SortOrder ='asc'  THEN Name END ASC,
		CASE WHEN @SortColumn = 'title'		    AND @SortOrder ='desc' THEN Name END DESC

    OFFSET (@PageSize * @PageNumber) ROWS
    FETCH NEXT @PageSize ROWS ONLY;

END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE Procedure [dbo].[Sp_GetCategoyDropdown]
AS BEGIN
   SELECT CategoryId as ID, Name FROM tblCategory
END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Sp_GetProductsWithPagination]
(
    @PageNumber INT,
    @PageSize INT,
	@Search Nvarchar(20)=NULL,
	@IsActive INT=NULL
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
	   COUNT(*) Over() As TotalRecord,
	   ROW_NUMBER() OVER (ORDER BY prd.ProductID) AS SrNo,
        ProductID,
        ProductName,
        Price,
        StockQuantity,
        SKU,
        prd.IsActive,
        cat.Name as CategoryName
    FROM tblProduct prd
	JOIN tblCategory cat ON prd.Category_ID=cat.CategoryId
    
	Where (@Search IS NULL OR prd.ProductName LIKE '%' + @Search + '%' OR prd.SKU LIKE '%' + @Search + '%')
	AND (@IsActive IS NULL OR prd.IsActive=@IsActive)

	ORDER BY ProductID 

    OFFSET (@PageNumber * @PageSize) ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Sp_GetProductWithImages]
    @ProductID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        p.ProductID,
        p.ProductName,
        p.Price,
        p.StockQuantity,
        p.SKU,
        p.IsActive,
        p.CreatedDate,
        p.Category_ID,
        c.Name AS CategoryName,
        i.ImagePath,
		i.ImageId,
		i.IsActive as ImageStatus,
        i.FileName AS ImageFileName
    FROM tblProduct p
    JOIN tblCategory c ON p.Category_ID = c.CategoryID
    LEFT JOIN tblImages i ON p.ProductID = i.Product_ID
    WHERE p.ProductID = @ProductID;
END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_GetSubCategoryList]  --1
(
    @CategoryID INT, 
    @PageNumber INT = 0,  
    @PageSize INT = 10,
    @Search NVARCHAR(20) = NULL,
	@IsActive INT=NULL
)
AS
BEGIN
    SELECT 
        CategoryID, 
        [Name] as 'Title', 
        Description, 
        IsActive, 
        ParentCategoryID, 
        Path, 
        CategoryLevel, 
        Icon, 
        CreatedDate,
		ROW_NUMBER() OVER (ORDER BY [CategoryId]) AS SrNo, 
        COUNT(*) OVER () AS TotalRecord
    FROM 
        tblCategory
    WHERE 
	  
	  (@IsActive IS NULL OR  IsActive=@IsActive)
      
	  AND CategoryLevel >= 0
      AND (@Search IS NULL OR  [Name] LIKE '%' + @Search + '%' OR Description LIKE '%' + @Search + '%')
    
	ORDER BY 
        ParentCategoryID, CategoryID

    OFFSET (@PageSize * @PageNumber) ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[Sp_UpdateCategory]
(
    @CategoryId INT,
    @Name NVARCHAR(255),
    @Description NVARCHAR(1000),
    @Icon  Nvarchar(max),
    @IsActive BIT
)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [dbo].[tblCategory]
    SET 
        [Name] = @Name,
        [Description] = @Description,
        [Icon] = @Icon,
        [IsActive] = @IsActive
    WHERE [CategoryId] = @CategoryId;

    SELECT 
        [CategoryId],
        [Name] as Title,
        [Description],
        [Icon] as IConImage,
        [IsActive]
    FROM [dbo].[tblCategory]
    WHERE [CategoryId] = @CategoryId;
END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[Sp_UpdateSubCategory]
(
    @CategoryId INT,
    @Name NVARCHAR(255),
    @Description NVARCHAR(1000),
    @IsActive BIT
)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [dbo].[tblCategory]
    SET 
        [Name] = @Name,
        [Description] = @Description,
        [IsActive] = @IsActive
    WHERE [CategoryId] = @CategoryId;

    SELECT 
        [CategoryId],
        [Name] as Title,
        [Description],
        [Icon] as IConImage,
        [IsActive]
    FROM [dbo].[tblCategory]
    WHERE [CategoryId] = @CategoryId;
END
GO
USE [TaskDb]
GO
CREATE TYPE [dbo].[ImageTableType] AS TABLE(
	[ImageFilePath] [nvarchar](255) NOT NULL,
	[FileName] [nvarchar](255) NOT NULL
)
GO
CREATE TYPE [dbo].[tblProductImages] AS TABLE(
	[ImageFilePath] [nvarchar](255) NULL,
	[FileName] [nvarchar](255) NULL
)
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tblCategory](
	[CategoryID] [int] IDENTITY(1,1) NOT NULL,
	[Name] [varchar](255) NOT NULL,
	[Description] [text] NULL,
	[IsActive] [int] NOT NULL,
	[ParentCategoryID] [int] NULL,
	[Path] [varchar](200) NULL,
	[CategoryLevel] [int] NULL,
	[Icon] [nvarchar](max) NULL,
	[CreatedDate] [datetime] NULL,
 CONSTRAINT [PK__tblCateg__19093A2B5006D21B] PRIMARY KEY CLUSTERED 
(
	[CategoryID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tblImages](
	[ImageId] [int] IDENTITY(1,1) NOT NULL,
	[ImagePath] [varchar](99) NULL,
	[Product_ID] [int] NULL,
	[IsActive] [bit] NULL,
	[CreatedBy] [int] NULL,
	[DreatedDate] [datetime] NULL,
	[FileName] [nvarchar](200) NULL,
 CONSTRAINT [PK_tblImages] PRIMARY KEY CLUSTERED 
(
	[ImageId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tblProduct](
	[ProductID] [int] IDENTITY(1,1) NOT NULL,
	[ProductName] [varchar](50) NULL,
	[Price] [decimal](18, 0) NULL,
	[StockQuantity] [int] NULL,
	[SKU] [varchar](50) NULL,
	[IsActive] [bit] NULL,
	[CreatedBy] [int] NULL,
	[CreatedDate] [datetime] NULL,
	[Category_ID] [int] NULL,
 CONSTRAINT [PK_tblProduct] PRIMARY KEY CLUSTERED 
(
	[ProductID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[tblCategory] ADD  CONSTRAINT [DF__tblCatego__IsAct__3C69FB99]  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[tblCategory] ADD  CONSTRAINT [DF__tblCatego__Updat__3E52440B]  DEFAULT (getdate()) FOR [CreatedDate]
GO
ALTER TABLE [dbo].[tblCategory]  WITH CHECK ADD  CONSTRAINT [FK_Category_Parent] FOREIGN KEY([ParentCategoryID])
REFERENCES [dbo].[tblCategory] ([CategoryID])
GO
ALTER TABLE [dbo].[tblCategory] CHECK CONSTRAINT [FK_Category_Parent]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Sp_CreateCategory]
    @ParentCategoryID INT = NULL,      
    @Title VARCHAR(255),               
    @Description TEXT = NULL,          
    @IsActive BIT = 1,
	@Icon Nvarchar(max)
AS
BEGIN
    DECLARE @CategoryLevel INT;

    IF @ParentCategoryID IS NOT NULL
    BEGIN
        SELECT @CategoryLevel = CategoryLevel
        FROM [tblCategory]
        WHERE CategoryID = @ParentCategoryID;
        SET @CategoryLevel = @CategoryLevel + 1;
    END
    ELSE
    BEGIN
        SET @CategoryLevel = 0; 
    END

    INSERT INTO [tblCategory](ParentCategoryID, Name, Description, IsActive, CategoryLevel,Icon,[Path], CreatedDate)
    VALUES (NULL, @Title, @Description, @IsActive, @CategoryLevel,@Icon,@Title, GETDATE());

    SELECT SCOPE_IDENTITY() AS CategoryID;
END;
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[Sp_CreateProduct]
(
    @ProductName NVARCHAR(100),
    @Price DECIMAL(18, 2),
    @StockQuantity INT,
    @SKU NVARCHAR(50),
    @IsActive BIT,
    @CategoryID INT,

   @Images dbo.tblProductImages READONLY
)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO tblProduct
    (   
	    ProductName,
        Price,
        StockQuantity,
        SKU,
        IsActive,
        CreatedDate,
        Category_ID
    )
    VALUES
    (
        @ProductName,
        @Price,
        @StockQuantity,
        @SKU,
        @IsActive,
        GETDATE(),
        @CategoryID
    );

    DECLARE @NewProductID INT = SCOPE_IDENTITY(); -- Get the last inserted ProductID

	IF Exists(Select Top 1 * FROM [dbo].[tblImages])
	BEGIN
    INSERT INTO [dbo].[tblImages]
    (
		 Product_ID,
         ImagePath,
		 IsActive,
		 DreatedDate,
		 FileName
    )
    SELECT 
		@NewProductID,
        t.ImageFilePath,
		1,
		GetDate(),
		t.FileName
    FROM @Images t;
	
	END
	SELECT  @NewProductID
END



GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Sp_CreateSubCategory]
(
    @Name NVARCHAR(100),
    @Description NVARCHAR(500),
    @IsActive BIT,
    @ParentCategoryID INT = NULL,  
	@Icon Nvarchar(max)=NULL,
    @CategoryLevel INT = 1        
)
AS
BEGIN
    SET NOCOUNT ON;
    
	Declare @Path Nvarchar(max)

    IF @ParentCategoryID IS NOT NULL
    BEGIN
        DECLARE @ParentCategoryLevel INT;
        SELECT @ParentCategoryLevel = CategoryLevel 
        FROM tblCategory
        WHERE CategoryID = @ParentCategoryID;

        SET @CategoryLevel = ISNULL(@ParentCategoryLevel,0) + 1;
        SELECT @Path = CONCAT((SELECT Path FROM tblCategory WHERE CategoryID = @ParentCategoryID), '>>', @Name);
    END

    INSERT INTO tblCategory (Name, Description, IsActive, ParentCategoryID, Path, CategoryLevel,Icon)
    VALUES (@Name, @Description, @IsActive, @ParentCategoryID, @Path, @CategoryLevel,@Icon);
    
    SELECT SCOPE_IDENTITY() AS CategoryID;
END


GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE Procedure [dbo].[Sp_DeleteCategory]
(
@CatgoryID INT
)
AS BEGIN
Update tblCategory SET IsActive=0 Where CategoryID=@CatgoryID
Select 1 as Success

END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE Procedure [dbo].[Sp_DeleteProduct]
(
@ProductID INT
)
AS BEGIN
Update tblProduct SET IsActive=0 Where ProductID=@ProductID
Select 1 as Success

END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE Procedure [dbo].[Sp_DeleteProductImage]
(
@ImageId INT
)
AS BEGIN


Update tblImages SET IsActive=0 Where ImageId=@ImageId
Select ImagePath from tblImages Where ImageId=@ImageId

END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[Sp_EditProduct]
(
    @ProductID INT,
    @ProductName NVARCHAR(100),
    @Price DECIMAL(18, 2),
    @StockQuantity INT,
    @SKU NVARCHAR(50),
    @IsActive BIT,
    @CategoryID INT,
    @Images dbo.tblProductImages READONLY
)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE tblProduct
    SET
        ProductName = @ProductName,
        Price = @Price,
        StockQuantity = @StockQuantity,
        SKU = @SKU,
        IsActive = @IsActive,
        Category_ID = @CategoryID,
        CreatedDate = GETDATE() 
    WHERE ProductID = @ProductID;

    --DELETE FROM tblImages WHERE Product_ID = @ProductID;

    INSERT INTO [dbo].[tblImages]
    (
        Product_ID,
        ImagePath,
        IsActive,
        DreatedDate,
        FileName
    )
    SELECT 
        @ProductID, 
        t.ImageFilePath,
        1, 
        GETDATE(),
        t.FileName
    FROM @Images t;

    SELECT @ProductID AS UpdatedProductID;

END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Sp_GetCategoryById]
(
@CategoryID INT
)
AS
BEGIN
   SET NOCOUNT ON;
    SELECT 
         CategoryID,
        [Name] AS Title,
        [Description],
        ISNULL([Icon], '') AS Icon,
        [IsActive]
    FROM [dbo].[tblCategory]
    WHERE [CategoryId] = @CategoryID
END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_GetCategoryList]
(
    @PageNumber INT = 0,  
    @PageSize INT = 10,
    @Search NVARCHAR(20) = NULL,
	@IsActive INT=null,
	@SortColumn Nvarchar(20)='title',
	@SortOrder Nvarchar(5)='asc'
)
AS
BEGIN
	 
	 SELECT
	 ROW_NUMBER() OVER (
         ORDER BY 
		CASE WHEN @SortColumn = 'isActive'      AND @SortOrder ='asc'  THEN IsActive    END ASC,
		CASE WHEN @SortColumn = 'isActive'      AND @SortOrder ='desc' THEN IsActive    END DESC,
		CASE WHEN @SortColumn = 'title'         AND @SortOrder ='asc'  THEN Name END ASC,
		CASE WHEN @SortColumn = 'title'		    AND @SortOrder ='desc' THEN Name END DESC
        ) AS SrNo,
	    [CategoryId],
        [Name] AS Title,
        CAST([Description] AS NVARCHAR(MAX)) AS Description, -- Convert text to NVARCHAR(MAX)
        [Icon],
        [CreatedDate],
        [IsActive],
        COUNT(*) OVER () AS TotalRecord
    FROM 
        tblCategory
    WHERE 
        (@Search IS NULL OR [Name] LIKE '%' + @Search + '%')
        AND(@IsActive IS NULL OR IsActive=@IsActive)
		ORDER BY 

		CASE WHEN @SortColumn = 'isActive'      AND @SortOrder ='asc'  THEN IsActive    END ASC,
		CASE WHEN @SortColumn = 'isActive'      AND @SortOrder ='desc' THEN IsActive    END DESC,
		CASE WHEN @SortColumn = 'title'         AND @SortOrder ='asc'  THEN Name END ASC,
		CASE WHEN @SortColumn = 'title'		    AND @SortOrder ='desc' THEN Name END DESC

    OFFSET (@PageSize * @PageNumber) ROWS
    FETCH NEXT @PageSize ROWS ONLY;

END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE Procedure [dbo].[Sp_GetCategoyDropdown]
AS BEGIN
   SELECT CategoryId as ID, Name FROM tblCategory
END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Sp_GetProductsWithPagination]
(
    @PageNumber INT,
    @PageSize INT,
	@Search Nvarchar(20)=NULL,
	@IsActive INT=NULL
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
	   COUNT(*) Over() As TotalRecord,
	   ROW_NUMBER() OVER (ORDER BY prd.ProductID) AS SrNo,
        ProductID,
        ProductName,
        Price,
        StockQuantity,
        SKU,
        prd.IsActive,
        cat.Name as CategoryName
    FROM tblProduct prd
	JOIN tblCategory cat ON prd.Category_ID=cat.CategoryId
    
	Where (@Search IS NULL OR prd.ProductName LIKE '%' + @Search + '%' OR prd.SKU LIKE '%' + @Search + '%')
	AND (@IsActive IS NULL OR prd.IsActive=@IsActive)

	ORDER BY ProductID 

    OFFSET (@PageNumber * @PageSize) ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Sp_GetProductWithImages]
    @ProductID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        p.ProductID,
        p.ProductName,
        p.Price,
        p.StockQuantity,
        p.SKU,
        p.IsActive,
        p.CreatedDate,
        p.Category_ID,
        c.Name AS CategoryName,
        i.ImagePath,
		i.ImageId,
		i.IsActive as ImageStatus,
        i.FileName AS ImageFileName
    FROM tblProduct p
    JOIN tblCategory c ON p.Category_ID = c.CategoryID
    LEFT JOIN tblImages i ON p.ProductID = i.Product_ID
    WHERE p.ProductID = @ProductID;
END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_GetSubCategoryList]  --1
(
    @CategoryID INT, 
    @PageNumber INT = 0,  
    @PageSize INT = 10,
    @Search NVARCHAR(20) = NULL,
	@IsActive INT=NULL
)
AS
BEGIN
    SELECT 
        CategoryID, 
        [Name] as 'Title', 
        Description, 
        IsActive, 
        ParentCategoryID, 
        Path, 
        CategoryLevel, 
        Icon, 
        CreatedDate,
		ROW_NUMBER() OVER (ORDER BY [CategoryId]) AS SrNo, 
        COUNT(*) OVER () AS TotalRecord
    FROM 
        tblCategory
    WHERE 
	  
	  (@IsActive IS NULL OR  IsActive=@IsActive)
      
	  AND CategoryLevel >= 0
      AND (@Search IS NULL OR  [Name] LIKE '%' + @Search + '%' OR Description LIKE '%' + @Search + '%')
    
	ORDER BY 
        ParentCategoryID, CategoryID

    OFFSET (@PageSize * @PageNumber) ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[Sp_UpdateCategory]
(
    @CategoryId INT,
    @Name NVARCHAR(255),
    @Description NVARCHAR(1000),
    @Icon  Nvarchar(max),
    @IsActive BIT
)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [dbo].[tblCategory]
    SET 
        [Name] = @Name,
        [Description] = @Description,
        [Icon] = @Icon,
        [IsActive] = @IsActive
    WHERE [CategoryId] = @CategoryId;

    SELECT 
        [CategoryId],
        [Name] as Title,
        [Description],
        [Icon] as IConImage,
        [IsActive]
    FROM [dbo].[tblCategory]
    WHERE [CategoryId] = @CategoryId;
END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[Sp_UpdateSubCategory]
(
    @CategoryId INT,
    @Name NVARCHAR(255),
    @Description NVARCHAR(1000),
    @IsActive BIT
)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [dbo].[tblCategory]
    SET 
        [Name] = @Name,
        [Description] = @Description,
        [IsActive] = @IsActive
    WHERE [CategoryId] = @CategoryId;

    SELECT 
        [CategoryId],
        [Name] as Title,
        [Description],
        [Icon] as IConImage,
        [IsActive]
    FROM [dbo].[tblCategory]
    WHERE [CategoryId] = @CategoryId;
END
GO
USE [TaskDb]
GO
CREATE TYPE [dbo].[ImageTableType] AS TABLE(
	[ImageFilePath] [nvarchar](255) NOT NULL,
	[FileName] [nvarchar](255) NOT NULL
)
GO
CREATE TYPE [dbo].[tblProductImages] AS TABLE(
	[ImageFilePath] [nvarchar](255) NULL,
	[FileName] [nvarchar](255) NULL
)
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tblCategory](
	[CategoryID] [int] IDENTITY(1,1) NOT NULL,
	[Name] [varchar](255) NOT NULL,
	[Description] [text] NULL,
	[IsActive] [int] NOT NULL,
	[ParentCategoryID] [int] NULL,
	[Path] [varchar](200) NULL,
	[CategoryLevel] [int] NULL,
	[Icon] [nvarchar](max) NULL,
	[CreatedDate] [datetime] NULL,
 CONSTRAINT [PK__tblCateg__19093A2B5006D21B] PRIMARY KEY CLUSTERED 
(
	[CategoryID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tblImages](
	[ImageId] [int] IDENTITY(1,1) NOT NULL,
	[ImagePath] [varchar](99) NULL,
	[Product_ID] [int] NULL,
	[IsActive] [bit] NULL,
	[CreatedBy] [int] NULL,
	[DreatedDate] [datetime] NULL,
	[FileName] [nvarchar](200) NULL,
 CONSTRAINT [PK_tblImages] PRIMARY KEY CLUSTERED 
(
	[ImageId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tblProduct](
	[ProductID] [int] IDENTITY(1,1) NOT NULL,
	[ProductName] [varchar](50) NULL,
	[Price] [decimal](18, 0) NULL,
	[StockQuantity] [int] NULL,
	[SKU] [varchar](50) NULL,
	[IsActive] [bit] NULL,
	[CreatedBy] [int] NULL,
	[CreatedDate] [datetime] NULL,
	[Category_ID] [int] NULL,
 CONSTRAINT [PK_tblProduct] PRIMARY KEY CLUSTERED 
(
	[ProductID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[tblCategory] ADD  CONSTRAINT [DF__tblCatego__IsAct__3C69FB99]  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[tblCategory] ADD  CONSTRAINT [DF__tblCatego__Updat__3E52440B]  DEFAULT (getdate()) FOR [CreatedDate]
GO
ALTER TABLE [dbo].[tblCategory]  WITH CHECK ADD  CONSTRAINT [FK_Category_Parent] FOREIGN KEY([ParentCategoryID])
REFERENCES [dbo].[tblCategory] ([CategoryID])
GO
ALTER TABLE [dbo].[tblCategory] CHECK CONSTRAINT [FK_Category_Parent]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Sp_CreateCategory]
    @ParentCategoryID INT = NULL,      
    @Title VARCHAR(255),               
    @Description TEXT = NULL,          
    @IsActive BIT = 1,
	@Icon Nvarchar(max)
AS
BEGIN
    DECLARE @CategoryLevel INT;

    IF @ParentCategoryID IS NOT NULL
    BEGIN
        SELECT @CategoryLevel = CategoryLevel
        FROM [tblCategory]
        WHERE CategoryID = @ParentCategoryID;
        SET @CategoryLevel = @CategoryLevel + 1;
    END
    ELSE
    BEGIN
        SET @CategoryLevel = 0; 
    END

    INSERT INTO [tblCategory](ParentCategoryID, Name, Description, IsActive, CategoryLevel,Icon,[Path], CreatedDate)
    VALUES (NULL, @Title, @Description, @IsActive, @CategoryLevel,@Icon,@Title, GETDATE());

    SELECT SCOPE_IDENTITY() AS CategoryID;
END;
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[Sp_CreateProduct]
(
    @ProductName NVARCHAR(100),
    @Price DECIMAL(18, 2),
    @StockQuantity INT,
    @SKU NVARCHAR(50),
    @IsActive BIT,
    @CategoryID INT,

   @Images dbo.tblProductImages READONLY
)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO tblProduct
    (   
	    ProductName,
        Price,
        StockQuantity,
        SKU,
        IsActive,
        CreatedDate,
        Category_ID
    )
    VALUES
    (
        @ProductName,
        @Price,
        @StockQuantity,
        @SKU,
        @IsActive,
        GETDATE(),
        @CategoryID
    );

    DECLARE @NewProductID INT = SCOPE_IDENTITY(); -- Get the last inserted ProductID

	IF Exists(Select Top 1 * FROM [dbo].[tblImages])
	BEGIN
    INSERT INTO [dbo].[tblImages]
    (
		 Product_ID,
         ImagePath,
		 IsActive,
		 DreatedDate,
		 FileName
    )
    SELECT 
		@NewProductID,
        t.ImageFilePath,
		1,
		GetDate(),
		t.FileName
    FROM @Images t;
	
	END
	SELECT  @NewProductID
END



GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Sp_CreateSubCategory]
(
    @Name NVARCHAR(100),
    @Description NVARCHAR(500),
    @IsActive BIT,
    @ParentCategoryID INT = NULL,  
	@Icon Nvarchar(max)=NULL,
    @CategoryLevel INT = 1        
)
AS
BEGIN
    SET NOCOUNT ON;
    
	Declare @Path Nvarchar(max)

    IF @ParentCategoryID IS NOT NULL
    BEGIN
        DECLARE @ParentCategoryLevel INT;
        SELECT @ParentCategoryLevel = CategoryLevel 
        FROM tblCategory
        WHERE CategoryID = @ParentCategoryID;

        SET @CategoryLevel = ISNULL(@ParentCategoryLevel,0) + 1;
        SELECT @Path = CONCAT((SELECT Path FROM tblCategory WHERE CategoryID = @ParentCategoryID), '>>', @Name);
    END

    INSERT INTO tblCategory (Name, Description, IsActive, ParentCategoryID, Path, CategoryLevel,Icon)
    VALUES (@Name, @Description, @IsActive, @ParentCategoryID, @Path, @CategoryLevel,@Icon);
    
    SELECT SCOPE_IDENTITY() AS CategoryID;
END


GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE Procedure [dbo].[Sp_DeleteCategory]
(
@CatgoryID INT
)
AS BEGIN
Update tblCategory SET IsActive=0 Where CategoryID=@CatgoryID
Select 1 as Success

END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE Procedure [dbo].[Sp_DeleteProduct]
(
@ProductID INT
)
AS BEGIN
Update tblProduct SET IsActive=0 Where ProductID=@ProductID
Select 1 as Success

END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE Procedure [dbo].[Sp_DeleteProductImage]
(
@ImageId INT
)
AS BEGIN


Update tblImages SET IsActive=0 Where ImageId=@ImageId
Select ImagePath from tblImages Where ImageId=@ImageId

END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[Sp_EditProduct]
(
    @ProductID INT,
    @ProductName NVARCHAR(100),
    @Price DECIMAL(18, 2),
    @StockQuantity INT,
    @SKU NVARCHAR(50),
    @IsActive BIT,
    @CategoryID INT,
    @Images dbo.tblProductImages READONLY
)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE tblProduct
    SET
        ProductName = @ProductName,
        Price = @Price,
        StockQuantity = @StockQuantity,
        SKU = @SKU,
        IsActive = @IsActive,
        Category_ID = @CategoryID,
        CreatedDate = GETDATE() 
    WHERE ProductID = @ProductID;

    --DELETE FROM tblImages WHERE Product_ID = @ProductID;

    INSERT INTO [dbo].[tblImages]
    (
        Product_ID,
        ImagePath,
        IsActive,
        DreatedDate,
        FileName
    )
    SELECT 
        @ProductID, 
        t.ImageFilePath,
        1, 
        GETDATE(),
        t.FileName
    FROM @Images t;

    SELECT @ProductID AS UpdatedProductID;

END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Sp_GetCategoryById]
(
@CategoryID INT
)
AS
BEGIN
   SET NOCOUNT ON;
    SELECT 
         CategoryID,
        [Name] AS Title,
        [Description],
        ISNULL([Icon], '') AS Icon,
        [IsActive]
    FROM [dbo].[tblCategory]
    WHERE [CategoryId] = @CategoryID
END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_GetCategoryList]
(
    @PageNumber INT = 0,  
    @PageSize INT = 10,
    @Search NVARCHAR(20) = NULL,
	@IsActive INT=null,
	@SortColumn Nvarchar(20)='title',
	@SortOrder Nvarchar(5)='asc'
)
AS
BEGIN
	 
	 SELECT
	 ROW_NUMBER() OVER (
         ORDER BY 
		CASE WHEN @SortColumn = 'isActive'      AND @SortOrder ='asc'  THEN IsActive    END ASC,
		CASE WHEN @SortColumn = 'isActive'      AND @SortOrder ='desc' THEN IsActive    END DESC,
		CASE WHEN @SortColumn = 'title'         AND @SortOrder ='asc'  THEN Name END ASC,
		CASE WHEN @SortColumn = 'title'		    AND @SortOrder ='desc' THEN Name END DESC
        ) AS SrNo,
	    [CategoryId],
        [Name] AS Title,
        CAST([Description] AS NVARCHAR(MAX)) AS Description, -- Convert text to NVARCHAR(MAX)
        [Icon],
        [CreatedDate],
        [IsActive],
        COUNT(*) OVER () AS TotalRecord
    FROM 
        tblCategory
    WHERE 
        (@Search IS NULL OR [Name] LIKE '%' + @Search + '%')
        AND(@IsActive IS NULL OR IsActive=@IsActive)
		ORDER BY 

		CASE WHEN @SortColumn = 'isActive'      AND @SortOrder ='asc'  THEN IsActive    END ASC,
		CASE WHEN @SortColumn = 'isActive'      AND @SortOrder ='desc' THEN IsActive    END DESC,
		CASE WHEN @SortColumn = 'title'         AND @SortOrder ='asc'  THEN Name END ASC,
		CASE WHEN @SortColumn = 'title'		    AND @SortOrder ='desc' THEN Name END DESC

    OFFSET (@PageSize * @PageNumber) ROWS
    FETCH NEXT @PageSize ROWS ONLY;

END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE Procedure [dbo].[Sp_GetCategoyDropdown]
AS BEGIN
   SELECT CategoryId as ID, Name FROM tblCategory
END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Sp_GetProductsWithPagination]
(
    @PageNumber INT,
    @PageSize INT,
	@Search Nvarchar(20)=NULL,
	@IsActive INT=NULL
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
	   COUNT(*) Over() As TotalRecord,
	   ROW_NUMBER() OVER (ORDER BY prd.ProductID) AS SrNo,
        ProductID,
        ProductName,
        Price,
        StockQuantity,
        SKU,
        prd.IsActive,
        cat.Name as CategoryName
    FROM tblProduct prd
	JOIN tblCategory cat ON prd.Category_ID=cat.CategoryId
    
	Where (@Search IS NULL OR prd.ProductName LIKE '%' + @Search + '%' OR prd.SKU LIKE '%' + @Search + '%')
	AND (@IsActive IS NULL OR prd.IsActive=@IsActive)

	ORDER BY ProductID 

    OFFSET (@PageNumber * @PageSize) ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Sp_GetProductWithImages]
    @ProductID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        p.ProductID,
        p.ProductName,
        p.Price,
        p.StockQuantity,
        p.SKU,
        p.IsActive,
        p.CreatedDate,
        p.Category_ID,
        c.Name AS CategoryName,
        i.ImagePath,
		i.ImageId,
		i.IsActive as ImageStatus,
        i.FileName AS ImageFileName
    FROM tblProduct p
    JOIN tblCategory c ON p.Category_ID = c.CategoryID
    LEFT JOIN tblImages i ON p.ProductID = i.Product_ID
    WHERE p.ProductID = @ProductID;
END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_GetSubCategoryList]  --1
(
    @CategoryID INT, 
    @PageNumber INT = 0,  
    @PageSize INT = 10,
    @Search NVARCHAR(20) = NULL,
	@IsActive INT=NULL
)
AS
BEGIN
    SELECT 
        CategoryID, 
        [Name] as 'Title', 
        Description, 
        IsActive, 
        ParentCategoryID, 
        Path, 
        CategoryLevel, 
        Icon, 
        CreatedDate,
		ROW_NUMBER() OVER (ORDER BY [CategoryId]) AS SrNo, 
        COUNT(*) OVER () AS TotalRecord
    FROM 
        tblCategory
    WHERE 
	  
	  (@IsActive IS NULL OR  IsActive=@IsActive)
      
	  AND CategoryLevel >= 0
      AND (@Search IS NULL OR  [Name] LIKE '%' + @Search + '%' OR Description LIKE '%' + @Search + '%')
    
	ORDER BY 
        ParentCategoryID, CategoryID

    OFFSET (@PageSize * @PageNumber) ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[Sp_UpdateCategory]
(
    @CategoryId INT,
    @Name NVARCHAR(255),
    @Description NVARCHAR(1000),
    @Icon  Nvarchar(max),
    @IsActive BIT
)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [dbo].[tblCategory]
    SET 
        [Name] = @Name,
        [Description] = @Description,
        [Icon] = @Icon,
        [IsActive] = @IsActive
    WHERE [CategoryId] = @CategoryId;

    SELECT 
        [CategoryId],
        [Name] as Title,
        [Description],
        [Icon] as IConImage,
        [IsActive]
    FROM [dbo].[tblCategory]
    WHERE [CategoryId] = @CategoryId;
END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[Sp_UpdateSubCategory]
(
    @CategoryId INT,
    @Name NVARCHAR(255),
    @Description NVARCHAR(1000),
    @IsActive BIT
)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [dbo].[tblCategory]
    SET 
        [Name] = @Name,
        [Description] = @Description,
        [IsActive] = @IsActive
    WHERE [CategoryId] = @CategoryId;

    SELECT 
        [CategoryId],
        [Name] as Title,
        [Description],
        [Icon] as IConImage,
        [IsActive]
    FROM [dbo].[tblCategory]
    WHERE [CategoryId] = @CategoryId;
END
GO
USE [TaskDb]
GO
CREATE TYPE [dbo].[ImageTableType] AS TABLE(
	[ImageFilePath] [nvarchar](255) NOT NULL,
	[FileName] [nvarchar](255) NOT NULL
)
GO
CREATE TYPE [dbo].[tblProductImages] AS TABLE(
	[ImageFilePath] [nvarchar](255) NULL,
	[FileName] [nvarchar](255) NULL
)
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tblCategory](
	[CategoryID] [int] IDENTITY(1,1) NOT NULL,
	[Name] [varchar](255) NOT NULL,
	[Description] [text] NULL,
	[IsActive] [int] NOT NULL,
	[ParentCategoryID] [int] NULL,
	[Path] [varchar](200) NULL,
	[CategoryLevel] [int] NULL,
	[Icon] [nvarchar](max) NULL,
	[CreatedDate] [datetime] NULL,
 CONSTRAINT [PK__tblCateg__19093A2B5006D21B] PRIMARY KEY CLUSTERED 
(
	[CategoryID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tblImages](
	[ImageId] [int] IDENTITY(1,1) NOT NULL,
	[ImagePath] [varchar](99) NULL,
	[Product_ID] [int] NULL,
	[IsActive] [bit] NULL,
	[CreatedBy] [int] NULL,
	[DreatedDate] [datetime] NULL,
	[FileName] [nvarchar](200) NULL,
 CONSTRAINT [PK_tblImages] PRIMARY KEY CLUSTERED 
(
	[ImageId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tblProduct](
	[ProductID] [int] IDENTITY(1,1) NOT NULL,
	[ProductName] [varchar](50) NULL,
	[Price] [decimal](18, 0) NULL,
	[StockQuantity] [int] NULL,
	[SKU] [varchar](50) NULL,
	[IsActive] [bit] NULL,
	[CreatedBy] [int] NULL,
	[CreatedDate] [datetime] NULL,
	[Category_ID] [int] NULL,
 CONSTRAINT [PK_tblProduct] PRIMARY KEY CLUSTERED 
(
	[ProductID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[tblCategory] ADD  CONSTRAINT [DF__tblCatego__IsAct__3C69FB99]  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[tblCategory] ADD  CONSTRAINT [DF__tblCatego__Updat__3E52440B]  DEFAULT (getdate()) FOR [CreatedDate]
GO
ALTER TABLE [dbo].[tblCategory]  WITH CHECK ADD  CONSTRAINT [FK_Category_Parent] FOREIGN KEY([ParentCategoryID])
REFERENCES [dbo].[tblCategory] ([CategoryID])
GO
ALTER TABLE [dbo].[tblCategory] CHECK CONSTRAINT [FK_Category_Parent]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Sp_CreateCategory]
    @ParentCategoryID INT = NULL,      
    @Title VARCHAR(255),               
    @Description TEXT = NULL,          
    @IsActive BIT = 1,
	@Icon Nvarchar(max)
AS
BEGIN
    DECLARE @CategoryLevel INT;

    IF @ParentCategoryID IS NOT NULL
    BEGIN
        SELECT @CategoryLevel = CategoryLevel
        FROM [tblCategory]
        WHERE CategoryID = @ParentCategoryID;
        SET @CategoryLevel = @CategoryLevel + 1;
    END
    ELSE
    BEGIN
        SET @CategoryLevel = 0; 
    END

    INSERT INTO [tblCategory](ParentCategoryID, Name, Description, IsActive, CategoryLevel,Icon,[Path], CreatedDate)
    VALUES (NULL, @Title, @Description, @IsActive, @CategoryLevel,@Icon,@Title, GETDATE());

    SELECT SCOPE_IDENTITY() AS CategoryID;
END;
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[Sp_CreateProduct]
(
    @ProductName NVARCHAR(100),
    @Price DECIMAL(18, 2),
    @StockQuantity INT,
    @SKU NVARCHAR(50),
    @IsActive BIT,
    @CategoryID INT,

   @Images dbo.tblProductImages READONLY
)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO tblProduct
    (   
	    ProductName,
        Price,
        StockQuantity,
        SKU,
        IsActive,
        CreatedDate,
        Category_ID
    )
    VALUES
    (
        @ProductName,
        @Price,
        @StockQuantity,
        @SKU,
        @IsActive,
        GETDATE(),
        @CategoryID
    );

    DECLARE @NewProductID INT = SCOPE_IDENTITY(); -- Get the last inserted ProductID

	IF Exists(Select Top 1 * FROM [dbo].[tblImages])
	BEGIN
    INSERT INTO [dbo].[tblImages]
    (
		 Product_ID,
         ImagePath,
		 IsActive,
		 DreatedDate,
		 FileName
    )
    SELECT 
		@NewProductID,
        t.ImageFilePath,
		1,
		GetDate(),
		t.FileName
    FROM @Images t;
	
	END
	SELECT  @NewProductID
END



GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Sp_CreateSubCategory]
(
    @Name NVARCHAR(100),
    @Description NVARCHAR(500),
    @IsActive BIT,
    @ParentCategoryID INT = NULL,  
	@Icon Nvarchar(max)=NULL,
    @CategoryLevel INT = 1        
)
AS
BEGIN
    SET NOCOUNT ON;
    
	Declare @Path Nvarchar(max)

    IF @ParentCategoryID IS NOT NULL
    BEGIN
        DECLARE @ParentCategoryLevel INT;
        SELECT @ParentCategoryLevel = CategoryLevel 
        FROM tblCategory
        WHERE CategoryID = @ParentCategoryID;

        SET @CategoryLevel = ISNULL(@ParentCategoryLevel,0) + 1;
        SELECT @Path = CONCAT((SELECT Path FROM tblCategory WHERE CategoryID = @ParentCategoryID), '>>', @Name);
    END

    INSERT INTO tblCategory (Name, Description, IsActive, ParentCategoryID, Path, CategoryLevel,Icon)
    VALUES (@Name, @Description, @IsActive, @ParentCategoryID, @Path, @CategoryLevel,@Icon);
    
    SELECT SCOPE_IDENTITY() AS CategoryID;
END


GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE Procedure [dbo].[Sp_DeleteCategory]
(
@CatgoryID INT
)
AS BEGIN
Update tblCategory SET IsActive=0 Where CategoryID=@CatgoryID
Select 1 as Success

END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE Procedure [dbo].[Sp_DeleteProduct]
(
@ProductID INT
)
AS BEGIN
Update tblProduct SET IsActive=0 Where ProductID=@ProductID
Select 1 as Success

END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE Procedure [dbo].[Sp_DeleteProductImage]
(
@ImageId INT
)
AS BEGIN


Update tblImages SET IsActive=0 Where ImageId=@ImageId
Select ImagePath from tblImages Where ImageId=@ImageId

END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[Sp_EditProduct]
(
    @ProductID INT,
    @ProductName NVARCHAR(100),
    @Price DECIMAL(18, 2),
    @StockQuantity INT,
    @SKU NVARCHAR(50),
    @IsActive BIT,
    @CategoryID INT,
    @Images dbo.tblProductImages READONLY
)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE tblProduct
    SET
        ProductName = @ProductName,
        Price = @Price,
        StockQuantity = @StockQuantity,
        SKU = @SKU,
        IsActive = @IsActive,
        Category_ID = @CategoryID,
        CreatedDate = GETDATE() 
    WHERE ProductID = @ProductID;

    --DELETE FROM tblImages WHERE Product_ID = @ProductID;

    INSERT INTO [dbo].[tblImages]
    (
        Product_ID,
        ImagePath,
        IsActive,
        DreatedDate,
        FileName
    )
    SELECT 
        @ProductID, 
        t.ImageFilePath,
        1, 
        GETDATE(),
        t.FileName
    FROM @Images t;

    SELECT @ProductID AS UpdatedProductID;

END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Sp_GetCategoryById]
(
@CategoryID INT
)
AS
BEGIN
   SET NOCOUNT ON;
    SELECT 
         CategoryID,
        [Name] AS Title,
        [Description],
        ISNULL([Icon], '') AS Icon,
        [IsActive]
    FROM [dbo].[tblCategory]
    WHERE [CategoryId] = @CategoryID
END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_GetCategoryList]
(
    @PageNumber INT = 0,  
    @PageSize INT = 10,
    @Search NVARCHAR(20) = NULL,
	@IsActive INT=null,
	@SortColumn Nvarchar(20)='title',
	@SortOrder Nvarchar(5)='asc'
)
AS
BEGIN
	 
	 SELECT
	 ROW_NUMBER() OVER (
         ORDER BY 
		CASE WHEN @SortColumn = 'isActive'      AND @SortOrder ='asc'  THEN IsActive    END ASC,
		CASE WHEN @SortColumn = 'isActive'      AND @SortOrder ='desc' THEN IsActive    END DESC,
		CASE WHEN @SortColumn = 'title'         AND @SortOrder ='asc'  THEN Name END ASC,
		CASE WHEN @SortColumn = 'title'		    AND @SortOrder ='desc' THEN Name END DESC
        ) AS SrNo,
	    [CategoryId],
        [Name] AS Title,
        CAST([Description] AS NVARCHAR(MAX)) AS Description, -- Convert text to NVARCHAR(MAX)
        [Icon],
        [CreatedDate],
        [IsActive],
        COUNT(*) OVER () AS TotalRecord
    FROM 
        tblCategory
    WHERE 
        (@Search IS NULL OR [Name] LIKE '%' + @Search + '%')
        AND(@IsActive IS NULL OR IsActive=@IsActive)
		ORDER BY 

		CASE WHEN @SortColumn = 'isActive'      AND @SortOrder ='asc'  THEN IsActive    END ASC,
		CASE WHEN @SortColumn = 'isActive'      AND @SortOrder ='desc' THEN IsActive    END DESC,
		CASE WHEN @SortColumn = 'title'         AND @SortOrder ='asc'  THEN Name END ASC,
		CASE WHEN @SortColumn = 'title'		    AND @SortOrder ='desc' THEN Name END DESC

    OFFSET (@PageSize * @PageNumber) ROWS
    FETCH NEXT @PageSize ROWS ONLY;

END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE Procedure [dbo].[Sp_GetCategoyDropdown]
AS BEGIN
   SELECT CategoryId as ID, Name FROM tblCategory
END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Sp_GetProductsWithPagination]
(
    @PageNumber INT,
    @PageSize INT,
	@Search Nvarchar(20)=NULL,
	@IsActive INT=NULL
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
	   COUNT(*) Over() As TotalRecord,
	   ROW_NUMBER() OVER (ORDER BY prd.ProductID) AS SrNo,
        ProductID,
        ProductName,
        Price,
        StockQuantity,
        SKU,
        prd.IsActive,
        cat.Name as CategoryName
    FROM tblProduct prd
	JOIN tblCategory cat ON prd.Category_ID=cat.CategoryId
    
	Where (@Search IS NULL OR prd.ProductName LIKE '%' + @Search + '%' OR prd.SKU LIKE '%' + @Search + '%')
	AND (@IsActive IS NULL OR prd.IsActive=@IsActive)

	ORDER BY ProductID 

    OFFSET (@PageNumber * @PageSize) ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Sp_GetProductWithImages]
    @ProductID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        p.ProductID,
        p.ProductName,
        p.Price,
        p.StockQuantity,
        p.SKU,
        p.IsActive,
        p.CreatedDate,
        p.Category_ID,
        c.Name AS CategoryName,
        i.ImagePath,
		i.ImageId,
		i.IsActive as ImageStatus,
        i.FileName AS ImageFileName
    FROM tblProduct p
    JOIN tblCategory c ON p.Category_ID = c.CategoryID
    LEFT JOIN tblImages i ON p.ProductID = i.Product_ID
    WHERE p.ProductID = @ProductID;
END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_GetSubCategoryList]  --1
(
    @CategoryID INT, 
    @PageNumber INT = 0,  
    @PageSize INT = 10,
    @Search NVARCHAR(20) = NULL,
	@IsActive INT=NULL
)
AS
BEGIN
    SELECT 
        CategoryID, 
        [Name] as 'Title', 
        Description, 
        IsActive, 
        ParentCategoryID, 
        Path, 
        CategoryLevel, 
        Icon, 
        CreatedDate,
		ROW_NUMBER() OVER (ORDER BY [CategoryId]) AS SrNo, 
        COUNT(*) OVER () AS TotalRecord
    FROM 
        tblCategory
    WHERE 
	  
	  (@IsActive IS NULL OR  IsActive=@IsActive)
      
	  AND CategoryLevel >= 0
      AND (@Search IS NULL OR  [Name] LIKE '%' + @Search + '%' OR Description LIKE '%' + @Search + '%')
    
	ORDER BY 
        ParentCategoryID, CategoryID

    OFFSET (@PageSize * @PageNumber) ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[Sp_UpdateCategory]
(
    @CategoryId INT,
    @Name NVARCHAR(255),
    @Description NVARCHAR(1000),
    @Icon  Nvarchar(max),
    @IsActive BIT
)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [dbo].[tblCategory]
    SET 
        [Name] = @Name,
        [Description] = @Description,
        [Icon] = @Icon,
        [IsActive] = @IsActive
    WHERE [CategoryId] = @CategoryId;

    SELECT 
        [CategoryId],
        [Name] as Title,
        [Description],
        [Icon] as IConImage,
        [IsActive]
    FROM [dbo].[tblCategory]
    WHERE [CategoryId] = @CategoryId;
END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[Sp_UpdateSubCategory]
(
    @CategoryId INT,
    @Name NVARCHAR(255),
    @Description NVARCHAR(1000),
    @IsActive BIT
)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [dbo].[tblCategory]
    SET 
        [Name] = @Name,
        [Description] = @Description,
        [IsActive] = @IsActive
    WHERE [CategoryId] = @CategoryId;

    SELECT 
        [CategoryId],
        [Name] as Title,
        [Description],
        [Icon] as IConImage,
        [IsActive]
    FROM [dbo].[tblCategory]
    WHERE [CategoryId] = @CategoryId;
END
GO
